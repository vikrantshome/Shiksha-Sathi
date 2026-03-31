package com.shikshasathi.backend.api.service;

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
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final QuestionRepository questionRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

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
                .answers(submission.getAnswers())
                .score(score)
                .submittedAt(submission.getSubmittedAt())
                .status(submission.getStatus())
                .build();
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
        Map<String, Object> answers = submission.getAnswers();

        for (String questionId : assignment.getQuestionIds()) {
            Question question = questionRepository.findById(questionId).orElse(null);
            if (question == null) {
                continue;
            }

            String studentAnswer = stringifyAnswer(answers == null ? null : answers.get(questionId));
            String correctAnswer = stringifyAnswer(question.getCorrectAnswer());
            boolean isCorrect = answersMatch(studentAnswer, correctAnswer);
            int marks = question.getPoints() == null ? 0 : question.getPoints();
            int marksAwarded = isCorrect ? marks : 0;
            score += marksAwarded;

            feedback.add(QuestionFeedbackDTO.builder()
                    .questionId(question.getId())
                    .questionText(question.getText())
                    .studentAnswer(studentAnswer)
                    .correctAnswer(correctAnswer)
                    .isCorrect(isCorrect)
                    .marksAwarded(marksAwarded)
                    .build());
        }

        submission.setSubmittedAt(Instant.now());
        submission.setStudentRollNumber(firstNonBlank(submission.getStudentRollNumber(), submission.getStudentId()));
        submission.setScore(score);
        submission.setStatus("GRADED");
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
        return normalizeAnswer(studentAnswer).equals(normalizeAnswer(correctAnswer));
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

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }
}
