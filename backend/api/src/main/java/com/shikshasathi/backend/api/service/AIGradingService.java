package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.AIGradingResponse;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI-powered grading service supporting both NVIDIA API (primary) and HF Space (fallback).
 *
 * <p>Features:
 * <ul>
 *   <li>Retry with exponential backoff (max 3 attempts, 1s-4s delays)</li>
 *   <li>Response caching (24h TTL, 10k max entries via Caffeine)</li>
 *   <li>Fallback to HF Space on persistent API failure</li>
 *   <li>Smart JSON extraction from verbose model output</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIGradingService {

    private static final Pattern JSON_BLOCK_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 1000;

    private final AIGradingProperties aiGradingProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Grade a single subjective answer using the AI grading service.
     * Results are cached by cache key to avoid redundant API calls.
     */
    @Cacheable(value = "grading", key = "#questionText + '|' + #expectedAnswer + '|' + #studentAnswer + '|' + #maxMarks")
    public QuestionFeedbackDTO gradeAnswer(Question question, String expectedAnswer,
                                           String studentAnswer, int maxMarks) {
        if (!aiGradingProperties.isEnabled()) {
            log.info("AI grading disabled — question {} marked pending review", question.getId());
            return buildPendingReviewFeedback(question, expectedAnswer, studentAnswer, maxMarks,
                    "AI grading is disabled");
        }

        try {
            AIGradingResponse response = callAIGradingAgent(question.getText(), expectedAnswer, studentAnswer, maxMarks);
            return buildFeedbackFromAI(question, expectedAnswer, studentAnswer, response);
        } catch (RestClientException e) {
            log.warn("AI grading service unreachable for question {}: {}", question.getId(), e.getMessage());
            return handleAIFailure(question, expectedAnswer, studentAnswer, maxMarks);
        } catch (Exception e) {
            log.warn("AI grading response error for question {}: {}", question.getId(), e.getMessage());
            return handleAIFailure(question, expectedAnswer, studentAnswer, maxMarks);
        }
    }

    /**
     * Called when AI grading fails. Defaults to marking the question as pending review.
     * Naviksha AI agent (Qwen3.5-2B) fallback is DISABLED — low accuracy model.
     * If explicitly configured, falls back to string matching.
     */
    private QuestionFeedbackDTO handleAIFailure(Question question, String expectedAnswer,
                                                 String studentAnswer, int maxMarks) {
        if (aiGradingProperties.isFallbackToStringMatch()) {
            log.warn("Using string-match fallback for question {} (explicitly configured)", question.getId());
            return stringMatchFallback(question, expectedAnswer, studentAnswer, maxMarks);
        }
        return buildPendingReviewFeedback(question, expectedAnswer, studentAnswer, maxMarks,
                "AI grading service unavailable — answer pending review");
    }

    /**
     * Call the AI grading agent via NVIDIA API only.
     * Naviksha AI agent (HF Space) fallback is disabled.
     */
    private AIGradingResponse callAIGradingAgent(String questionText, String expectedAnswer,
                                                  String studentAnswer, int maxMarks) {
        return callNvidiaApi(questionText, expectedAnswer, studentAnswer, maxMarks);
    }

    /**
     * Call NVIDIA API (OpenAI-compatible format) with retry and exponential backoff.
     * Handles 429 (rate limit) and 5xx errors with up to 3 retries.
     */
    private AIGradingResponse callNvidiaApi(String questionText, String expectedAnswer,
                                             String studentAnswer, int maxMarks) {
        String systemMsg = buildSystemPrompt();
        String userMsg = buildUserPrompt(questionText, expectedAnswer, studentAnswer, maxMarks);

        Map<String, Object> requestBody = new LinkedHashMap<>();
        requestBody.put("model", aiGradingProperties.getModel());
        requestBody.put("temperature", aiGradingProperties.getTemperature());

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemMsg));
        messages.add(Map.of("role", "user", "content", userMsg));
        requestBody.put("messages", messages);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + aiGradingProperties.getApiKey());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        String url = aiGradingProperties.getEndpointUrl();
        log.info("Calling NVIDIA API: model={}, endpoint={}", aiGradingProperties.getModel(), url);

        Exception lastException = null;
        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

                if (response.getBody() == null) {
                    throw new IllegalStateException("NVIDIA API returned empty body");
                }
                if (!response.getStatusCode().is2xxSuccessful()) {
                    throw new IllegalStateException("NVIDIA API returned " + response.getStatusCode());
                }

                if (attempt > 1) {
                    log.info("NVIDIA API succeeded on attempt {}", attempt);
                }
                return parseJsonContent(response.getBody());

            } catch (HttpServerErrorException e) {
                // 5xx errors — retryable
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    long backoff = INITIAL_BACKOFF_MS * (1L << (attempt - 1));
                    log.warn("NVIDIA API {} error (attempt {}/{}), retrying in {}ms: {}",
                            e.getStatusCode().value(), attempt, MAX_RETRIES, backoff, e.getMessage());
                    try {
                        Thread.sleep(backoff);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            } catch (RestClientException e) {
                // Network errors — retryable
                lastException = e;
                if (attempt < MAX_RETRIES) {
                    long backoff = INITIAL_BACKOFF_MS * (1L << (attempt - 1));
                    log.warn("NVIDIA API network error (attempt {}/{}), retrying in {}ms: {}",
                            attempt, MAX_RETRIES, backoff, e.getMessage());
                    try {
                        Thread.sleep(backoff);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            }
        }

        throw new RuntimeException("NVIDIA API failed after " + MAX_RETRIES + " attempts", lastException);
    }

    // --- Prompt Building ---

    private String buildSystemPrompt() {
        return "You are a STRICT expert teacher grading student answers. "
                + "Grade based on conceptual correctness, not keyword matching. "
                + "Be strict with factual accuracy.";
    }

    private String buildUserPrompt(String question, String expectedAnswer, String studentAnswer, int maxMarks) {
        String display = studentAnswer != null && !studentAnswer.trim().isEmpty() ? studentAnswer : "(blank)";
        return String.format(
                "Question: %s\n"
                + "Expected Answer: %s\n"
                + "Student's Answer: %s\n"
                + "Maximum Marks: %d\n\n"
                + "STRICT GRADING RULES (follow exactly):\n"
                + "1. If the student's answer is BLANK, award 0 marks.\n"
                + "2. If the student's answer CONTRADICTS or is FACTUALLY INCORRECT compared to the expected answer, award EXACTLY 0 marks. DO NOT give partial credit for wrong answers.\n"
                + "3. If the student's answer is CONCEPTUALLY CORRECT but uses different words, award full marks.\n"
                + "4. If the student's answer shows PARTIAL UNDERSTANDING (mentions relevant concepts but incomplete), award partial marks (between 1 and %d-1).\n"
                + "5. Accept synonyms, paraphrases, and equivalent expressions.\n"
                + "6. If the answer has MINOR SPELLING ERRORS but the concept is clearly correct (e.g., Jupitar for Jupiter), award full marks. Do not penalize phonetic misspellings of correct answers.\n"
                + "7. If the student gives a WRONG answer with correct-sounding reasoning, still award 0 marks.\n\n"
                + "IMPORTANT: The is_correct field must be true only if marks_awarded is more than half of max_marks. Otherwise it must be false.\n\n"
                + "Respond with ONLY a valid JSON object, nothing else:\n"
                + "{\n"
                + "  \"marks_awarded\": <number 0-%d>,\n"
                + "  \"max_marks\": %d,\n"
                + "  \"is_correct\": <true if marks > half of %d else false>,\n"
                + "  \"reasoning\": \"<one sentence explaining why this grade was given>\",\n"
                + "  \"confidence\": <number between 0.0 and 1.0>\n"
                + "}",
                question, expectedAnswer, display, maxMarks,
                maxMarks, maxMarks, maxMarks, maxMarks
        );
    }

    // --- Response Parsing ---

    /**
     * Parse JSON content from the NVIDIA model response.
     */
    private AIGradingResponse parseJsonContent(String text) {
        String jsonStr = extractJsonFromResponse(text);
        return parseJsonContentDirect(jsonStr);
    }

    private AIGradingResponse parseJsonContentDirect(String text) {
        try {
            JsonNode root = objectMapper.readTree(text);

            double marksAwarded = getDoubleField(root, "marks_awarded", 0);
            int maxMarks = getIntField(root, "max_marks", 0);
            boolean isCorrect = getBooleanField(root, "is_correct", false);
            String reasoning = getStringField(root, "reasoning", "");
            double confidence = getDoubleField(root, "confidence", 0.5);

            return AIGradingResponse.builder()
                    .marksAwarded(marksAwarded)
                    .maxMarks(maxMarks)
                    .isCorrect(isCorrect)
                    .reasoning(reasoning)
                    .confidence(confidence)
                    .build();
        } catch (Exception e) {
            // Try alternate parsing with single quotes
            try {
                String fixed = text.replace("'", "\"");
                JsonNode root = objectMapper.readTree(fixed);
                return AIGradingResponse.builder()
                        .marksAwarded(getDoubleField(root, "marks_awarded", 0))
                        .maxMarks(getIntField(root, "max_marks", 0))
                        .isCorrect(getBooleanField(root, "is_correct", false))
                        .reasoning(getStringField(root, "reasoning", ""))
                        .confidence(getDoubleField(root, "confidence", 0.5))
                        .build();
            } catch (Exception e2) {
                throw new IllegalStateException("Failed to parse JSON response: " + text.substring(0, Math.min(text.length(), 300)), e);
            }
        }
    }

    private String extractJsonFromResponse(String response) {
        String trimmed = response.trim();

        // Try markdown code block first
        Matcher matcher = JSON_BLOCK_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        // Find the FIRST complete JSON object by tracking brace depth
        int start = trimmed.indexOf('{');
        if (start < 0) {
            return trimmed;
        }

        int depth = 0;
        boolean inString = false;
        boolean escapeNext = false;

        for (int i = start; i < trimmed.length(); i++) {
            char ch = trimmed.charAt(i);
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (ch == '\\') {
                escapeNext = true;
                continue;
            }
            if (ch == '"' && !escapeNext) {
                inString = !inString;
                continue;
            }
            if (inString) {
                continue;
            }
            if (ch == '{') {
                depth++;
            } else if (ch == '}') {
                depth--;
                if (depth == 0) {
                    return trimmed.substring(start, i + 1);
                }
            }
        }

        // Fallback: grab everything between first { and last }
        int end = trimmed.lastIndexOf('}');
        if (end > start) {
            return trimmed.substring(start, end + 1);
        }

        return trimmed;
    }

    private double getDoubleField(JsonNode node, String field, double defaultValue) {
        JsonNode value = node.get(field);
        return value != null && value.isNumber() ? value.asDouble() : defaultValue;
    }

    private int getIntField(JsonNode node, String field, int defaultValue) {
        JsonNode value = node.get(field);
        return value != null && value.isNumber() ? value.asInt() : defaultValue;
    }

    private boolean getBooleanField(JsonNode node, String field, boolean defaultValue) {
        JsonNode value = node.get(field);
        return value != null && value.isBoolean() ? value.asBoolean() : defaultValue;
    }

    private String getStringField(JsonNode node, String field, String defaultValue) {
        JsonNode value = node.get(field);
        return value != null && value.isTextual() ? value.asText() : defaultValue;
    }

    // --- Feedback Building ---

    private QuestionFeedbackDTO buildFeedbackFromAI(Question question, String expectedAnswer,
                                                     String studentAnswer, AIGradingResponse response) {
        return QuestionFeedbackDTO.builder()
                .questionId(question.getId())
                .questionText(question.getText())
                .studentAnswer(studentAnswer)
                .correctAnswer(expectedAnswer)
                .isCorrect(response.isCorrect())
                .marksAwarded((int) Math.round(response.getMarksAwarded()))
                .reasoning(response.getReasoning())
                .confidence(response.getConfidence())
                .aiGradingFailed(false)
                .build();
    }

    private QuestionFeedbackDTO buildPendingReviewFeedback(Question question, String expectedAnswer,
                                                            String studentAnswer, int maxMarks,
                                                            String reason) {
        return QuestionFeedbackDTO.builder()
                .questionId(question.getId())
                .questionText(question.getText())
                .studentAnswer(studentAnswer)
                .correctAnswer(expectedAnswer)
                .isCorrect(false)
                .marksAwarded(0)
                .reasoning(reason)
                .confidence(0.0)
                .aiGradingFailed(true)
                .build();
    }

    /**
     * Fallback: grade using exact string matching. Only used when explicitly configured.
     */
    QuestionFeedbackDTO stringMatchFallback(Question question, String expectedAnswer,
                                             String studentAnswer, int maxMarks) {
        boolean isCorrect = answersMatch(studentAnswer, expectedAnswer);
        int marksAwarded = isCorrect ? maxMarks : 0;

        return QuestionFeedbackDTO.builder()
                .questionId(question.getId())
                .questionText(question.getText())
                .studentAnswer(studentAnswer)
                .correctAnswer(expectedAnswer)
                .isCorrect(isCorrect)
                .marksAwarded(marksAwarded)
                .reasoning(null)
                .confidence(null)
                .aiGradingFailed(false)
                .build();
    }

    // --- String matching logic ---

    private boolean answersMatch(String studentAnswer, String correctAnswer) {
        if (studentAnswer == null || correctAnswer == null) {
            return false;
        }

        String normalizedStudentAnswer = normalizeAnswer(studentAnswer);
        for (String acceptedAnswer : acceptedAnswers(correctAnswer)) {
            if (normalizedStudentAnswer.equals(normalizeAnswer(acceptedAnswer))) {
                return true;
            }
        }

        return false;
    }

    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return java.text.Normalizer.normalize(answer, java.text.Normalizer.Form.NFKC)
                .toLowerCase()
                .trim()
                .replaceAll("[\\p{Punct}\\p{S}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private java.util.List<String> acceptedAnswers(String correctAnswer) {
        java.util.List<String> accepted = new java.util.ArrayList<>();
        accepted.add(correctAnswer);

        java.util.regex.Matcher matcher = Pattern.compile(
                "^(.+?)\\s*\\((?:or\\s+)?(.+?)\\)$", java.util.regex.Pattern.CASE_INSENSITIVE
        ).matcher(correctAnswer.trim());
        if (matcher.matches()) {
            accepted.add(matcher.group(1).trim());
            accepted.add(matcher.group(2).trim());
        }

        return accepted;
    }
}
