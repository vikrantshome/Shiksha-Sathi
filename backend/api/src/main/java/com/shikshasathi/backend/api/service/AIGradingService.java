package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.AIGradingRequest;
import com.shikshasathi.backend.api.dto.AIGradingResponse;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * AI-powered grading service that calls a self-hosted LLM on Hugging Face Spaces.
 *
 * <p>When AI grading fails or is unavailable, subjective questions are marked as
 * {@code aiGradingFailed} with 0 marks. String matching is NOT used as a fallback
 * for subjective questions because it produces incorrect grades by design.
 * If configured, string-match fallback can be enabled explicitly.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIGradingService {

    private static final Pattern JSON_BLOCK_PATTERN = Pattern.compile("```json\\s*([\\s\\S]*?)```");

    private final AIGradingProperties aiGradingProperties;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Grade a single subjective answer using the AI grading agent.
     *
     * @param question       the question being graded
     * @param expectedAnswer the canonical correct answer
     * @param studentAnswer  the student's submitted answer
     * @param maxMarks       maximum marks for this question
     * @return QuestionFeedbackDTO with AI-graded results, or marked as pending review
     */
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
            // Network-level failures: timeout, connection refused, 5xx
            log.warn("AI grading service unreachable for question {}: {}", question.getId(), e.getMessage());
            return handleAIFailure(question, expectedAnswer, studentAnswer, maxMarks);
        } catch (Exception e) {
            // Parse errors, malformed responses
            log.warn("AI grading response error for question {}: {}", question.getId(), e.getMessage());
            return handleAIFailure(question, expectedAnswer, studentAnswer, maxMarks);
        }
    }

    /**
     * Called when AI grading fails. Defaults to marking the question as pending review.
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

    private AIGradingResponse callAIGradingAgent(String questionText, String expectedAnswer,
                                                  String studentAnswer, int maxMarks) {
        AIGradingRequest request = AIGradingRequest.builder()
                .question(questionText)
                .expectedAnswer(expectedAnswer)
                .studentAnswer(studentAnswer)
                .maxMarks(maxMarks)
                .build();

        String url = aiGradingProperties.getEndpointUrl() + "/grade";
        log.info("Calling AI grading endpoint: {}", url);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<AIGradingRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

        if (response.getBody() == null) {
            throw new IllegalStateException("AI grading endpoint returned empty body");
        }
        if (!response.getStatusCode().is2xxSuccessful()) {
            throw new IllegalStateException("AI grading endpoint returned " + response.getStatusCode());
        }

        return parseAIGradingResponse(response.getBody());
    }

    private AIGradingResponse parseAIGradingResponse(String rawResponse) {
        String jsonContent = extractJsonFromResponse(rawResponse);

        try {
            JsonNode root = objectMapper.readTree(jsonContent);

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
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to parse AI grading response: " + e.getMessage(), e);
        }
    }

    private String extractJsonFromResponse(String response) {
        String trimmed = response.trim();

        Matcher matcher = JSON_BLOCK_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
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

    /**
     * Marks a subjective question as pending review when AI grading is unavailable.
     * Awards 0 marks with a clear explanation so the student knows their answer
     * was received but not yet graded.
     */
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
     * Not recommended for subjective questions.
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

    // --- String matching logic (extracted from AssignmentSubmissionService for reuse) ---

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
