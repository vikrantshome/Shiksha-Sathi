package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.api.dto.SubmitAssignmentResponseDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizAttemptRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public QuizAttempt startAttempt(String quizId, String studentId) {
        User student = requireStudent(studentId);
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuizId(quiz.getId());
        attempt.setStudentId(student.getId());
        attempt.setStartedAt(Instant.now());
        attempt.setScore(0);
        attempt.setTotalMarks(quizTotalMarks(quiz));
        return quizAttemptRepository.save(attempt);
    }

    public SubmitAssignmentResponseDTO submitAttempt(String attemptId, String studentId, Map<String, String> answers) {
        User student = requireStudent(studentId);

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));
        if (!student.getId().equals(attempt.getStudentId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        if (attempt.getSubmittedAt() != null) {
            throw new IllegalArgumentException("This quiz attempt has already been submitted.");
        }

        Quiz quiz = quizRepository.findById(attempt.getQuizId())
                .orElseThrow(() -> new RuntimeException("Quiz not found"));

        Map<String, Integer> pointsMap = quiz.getQuestionPointsMap();
        List<QuestionFeedbackDTO> feedback = new ArrayList<>();
        int score = 0;

        for (String questionId : quiz.getQuestionIds()) {
            Optional<Question> maybeQuestion = questionRepository.findById(questionId);
            if (maybeQuestion.isEmpty()) {
                continue;
            }
            Question q = maybeQuestion.get();
            String studentAnswer = answers == null ? "" : String.valueOf(answers.getOrDefault(questionId, ""));
            String correctAnswer = q.getCorrectAnswer() == null ? "" : q.getCorrectAnswer();
            int marks = pointsMap != null ? pointsMap.getOrDefault(questionId, q.getPoints() != null ? q.getPoints() : 1) : (q.getPoints() != null ? q.getPoints() : 1);

            boolean isCorrect = answersMatch(studentAnswer, correctAnswer);
            int awarded = isCorrect ? marks : 0;
            score += awarded;

            feedback.add(QuestionFeedbackDTO.builder()
                    .questionId(q.getId())
                    .questionText(q.getText())
                    .studentAnswer(studentAnswer)
                    .correctAnswer(correctAnswer)
                    .isCorrect(isCorrect)
                    .marksAwarded(awarded)
                    .aiGradingFailed(false)
                    .build());
        }

        attempt.setAnswers(answers);
        attempt.setScore(score);
        attempt.setSubmittedAt(Instant.now());
        quizAttemptRepository.save(attempt);

        return SubmitAssignmentResponseDTO.builder()
                .success(true)
                .score(score)
                .totalMarks(attempt.getTotalMarks() == null ? quizTotalMarks(quiz) : attempt.getTotalMarks())
                .feedback(feedback)
                .build();
    }

    private int quizTotalMarks(Quiz quiz) {
        if (quiz == null || quiz.getQuestionIds() == null) {
            return 0;
        }
        Map<String, Integer> pointsMap = quiz.getQuestionPointsMap();
        int total = 0;
        for (String qId : quiz.getQuestionIds()) {
            int marks;
            if (pointsMap != null && pointsMap.containsKey(qId)) {
                marks = pointsMap.getOrDefault(qId, 1);
            } else {
                marks = questionRepository.findById(qId)
                        .map(q -> q.getPoints() != null && q.getPoints() > 0 ? q.getPoints() : 1)
                        .orElse(1);
            }
            total += Math.max(marks, 1);
        }
        return total;
    }

    private User requireStudent(String studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new org.springframework.security.access.AccessDeniedException("Student access required");
        }
        return user;
    }

    private boolean answersMatch(String studentAnswer, String correctAnswer) {
        if (studentAnswer == null || correctAnswer == null) {
            return false;
        }
        return normalizeAnswer(studentAnswer).equals(normalizeAnswer(correctAnswer));
    }

    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return Normalizer.normalize(answer, Normalizer.Form.NFKC)
                .toLowerCase()
                .trim()
                .replaceAll("[\\p{Punct}\\p{S}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }
}
