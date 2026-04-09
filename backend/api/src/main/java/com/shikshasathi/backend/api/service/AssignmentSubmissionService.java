package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.exception.DuplicateSubmissionException;
import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.api.dto.SubmitAssignmentResponseDTO;

import com.shikshasathi.backend.api.events.NotificationEvent;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {

    private static final Pattern PARENTHETICAL_OR_PATTERN = Pattern.compile("^(.+?)\\s*\\((?:or\\s+)?(.+?)\\)$", Pattern.CASE_INSENSITIVE);

    /** Question types that require AI-based conceptual grading. */
    private static final java.util.Set<String> AI_GRADED_TYPES = java.util.Set.of(
            "SHORT_ANSWER", "FILL_IN_BLANKS", "ESSAY"
    );

    private final AssignmentSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuestionRepository questionRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final AIGradingService aiGradingService;
    private final ObjectMapper objectMapper;

    public List<SubmissionDTO> getSubmissionsForAssignment(String assignmentId, String teacherEmail) {
        com.shikshasathi.backend.core.domain.user.User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view submissions for this assignment");
        }
    
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SubmissionDTO> getSubmissionsForStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SubmissionDTO mapToDTO(AssignmentSubmission submission) {
        String fallbackRollNumber = firstNonBlank(submission.getStudentRollNumber(), submission.getStudentId());
        String fallbackName = fallbackRollNumber == null ? "Unknown Student" : "Student " + fallbackRollNumber;
        String studentName = firstNonBlank(
                submission.getStudentName(),
                userRepository.findById(submission.getStudentId()).map(u -> u.getName()).orElse(null),
                fallbackName
        );
        String studentRollNumber = firstNonBlank(
                submission.getStudentRollNumber(),
                userRepository.findById(submission.getStudentId()).map(u -> u.getRollNumber()).orElse(null),
                fallbackRollNumber,
                "N/A"
        );
        int score = submission.getScore() == null ? 0 : submission.getScore();

        return SubmissionDTO.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignmentId())
                .studentId(submission.getStudentId())
                .studentName(studentName)
                .studentRollNumber(studentRollNumber)
                .school(submission.getSchool())
                .studentClass(submission.getStudentClass())
                .section(submission.getSection())
                .answers(submission.getAnswers())
                .score(score)
                .submittedAt(submission.getSubmittedAt())
                .status(submission.getStatus())
                .build();
    }

    /**
     * Get a single submission with full AI-graded feedback for results display.
     */
    public SubmissionDTO getSubmissionWithFeedback(String submissionId) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        List<QuestionFeedbackDTO> feedback = new ArrayList<>();
        String feedbackJson = submission.getFeedbackJson();
        if (feedbackJson != null && !feedbackJson.isBlank()) {
            try {
                feedback = objectMapper.readValue(feedbackJson, new TypeReference<List<QuestionFeedbackDTO>>() {});
            } catch (Exception e) {
                log.warn("Failed to deserialize feedback JSON for submission {}: {}", submissionId, e.getMessage());
            }
        }

        // Build DTO with feedback
        SubmissionDTO dto = mapToDTO(submission);
        dto.setFeedback(feedback);

        // Fetch assignment details for title and totalMarks
        try {
            Assignment assignment = assignmentRepository.findById(submission.getAssignmentId()).orElse(null);
            if (assignment != null) {
                dto.setAssignmentTitle(assignment.getTitle());
                dto.setTotalMarks(assignment.getMaxScore());
            }
        } catch (Exception e) {
            log.warn("Failed to fetch assignment for submission {}: {}", submissionId, e.getMessage());
        }

        return dto;
    }

    // Includes Duplicate Submission Prevention Logic (SSA-127)
    public SubmitAssignmentResponseDTO submitAssignment(AssignmentSubmission submission) {
        if (submissionRepository.findByAssignmentIdAndStudentId(submission.getAssignmentId(), submission.getStudentId()).isPresent()) {
            throw new DuplicateSubmissionException("Student has already submitted this assignment.");
        }

        Assignment assignment = assignmentRepository.findById(submission.getAssignmentId())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        List<QuestionFeedbackDTO> feedback = new ArrayList<>();
        int score = 0;
        boolean hasAIFailure = false;
        Map<String, Object> answers = submission.getAnswers();

        for (String questionId : assignment.getQuestionIds()) {
            Question question = questionRepository.findById(questionId).orElse(null);
            if (question == null) {
                continue;
            }

            String studentAnswer = stringifyAnswer(answers == null ? null : answers.get(questionId));
            String correctAnswer = stringifyAnswer(question.getCorrectAnswer());
            int marks = question.getPoints() == null ? 0 : question.getPoints();

            QuestionFeedbackDTO questionFeedback;
            if (shouldUseAIGrading(question.getType())) {
                questionFeedback = aiGradingService.gradeAnswer(question, correctAnswer, studentAnswer, marks);
                if (questionFeedback.isAiGradingFailed()) {
                    hasAIFailure = true;
                }
            } else {
                boolean isCorrect = answersMatch(studentAnswer, correctAnswer);
                int marksAwarded = isCorrect ? marks : 0;
                questionFeedback = QuestionFeedbackDTO.builder()
                        .questionId(question.getId())
                        .questionText(question.getText())
                        .studentAnswer(studentAnswer)
                        .correctAnswer(correctAnswer)
                        .isCorrect(isCorrect)
                        .marksAwarded(marksAwarded)
                        .build();
            }

            feedback.add(questionFeedback);
            score += questionFeedback.getMarksAwarded() == null ? 0 : questionFeedback.getMarksAwarded();
        }

        submission.setSubmittedAt(Instant.now());
        submission.setStudentRollNumber(firstNonBlank(submission.getStudentRollNumber(), submission.getStudentId()));
        submission.setScore(score);
        submission.setStatus(hasAIFailure ? "PARTIALLY_GRADED" : "GRADED");

        // Persist AI-graded feedback as JSON for results page display
        try {
            submission.setFeedbackJson(objectMapper.writeValueAsString(feedback));
        } catch (Exception e) {
            log.warn("Failed to serialize feedback JSON for submission: {}", e.getMessage());
        }

        AssignmentSubmission saved = submissionRepository.save(submission);
        eventPublisher.publishEvent(new NotificationEvent(this, submission.getStudentId(), "Assignment submitted successfully!"));

        return SubmitAssignmentResponseDTO.builder()
                .success(true)
                .score(saved.getScore() == null ? 0 : saved.getScore())
                .totalMarks(assignment.getMaxScore() == null ? 0 : assignment.getMaxScore())
                .feedback(feedback)
                .build();
    }

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

    private String stringifyAnswer(Object answer) {
        return answer == null ? "" : answer.toString();
    }

    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }

        String normalized = Normalizer.normalize(answer, Normalizer.Form.NFKC)
                .toLowerCase()
                .trim()
                .replaceAll("[\\p{Punct}\\p{S}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();

        return normalized;
    }

    private List<String> acceptedAnswers(String correctAnswer) {
        List<String> acceptedAnswers = new ArrayList<>();
        acceptedAnswers.add(correctAnswer);

        Matcher matcher = PARENTHETICAL_OR_PATTERN.matcher(correctAnswer.trim());
        if (matcher.matches()) {
            acceptedAnswers.add(matcher.group(1).trim());
            acceptedAnswers.add(matcher.group(2).trim());
        }

        return acceptedAnswers;
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }

    /**
     * Determines whether a question type should be graded by AI or exact matching.
     * AI grading: SHORT_ANSWER, FILL_IN_BLANKS, ESSAY
     * Exact match: MCQ, TRUE_FALSE, MULTIPLE_CHOICE, and any other type
     */
    private boolean shouldUseAIGrading(String questionType) {
        return questionType != null && AI_GRADED_TYPES.contains(questionType);
    }
}
