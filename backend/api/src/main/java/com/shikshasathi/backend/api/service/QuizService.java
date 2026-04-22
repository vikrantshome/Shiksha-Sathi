package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import com.shikshasathi.backend.api.dto.quiz.CreateQuizRequest;
import com.shikshasathi.backend.api.dto.quiz.StartQuizSessionResponse;
import com.shikshasathi.backend.api.dto.quiz.StudentQuizDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizSession;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizSessionRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private static final Set<String> SUPPORTED_QUIZ_TYPES = Set.of("MCQ", "TRUE_FALSE", "MULTIPLE_CHOICE");

    private final QuizRepository quizRepository;
    private final QuizSessionRepository quizSessionRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ClassRepository classRepository;

    public Quiz createQuiz(CreateQuizRequest request, String teacherId) {
        User teacher = requireTeacher(teacherId);

        if (request.getQuestionIds() == null || request.getQuestionIds().isEmpty()) {
            throw new IllegalArgumentException("Quiz must have at least one question.");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new IllegalArgumentException("Quiz title is required.");
        }

        if (request.getClassId() == null || request.getClassId().isBlank()) {
            throw new IllegalArgumentException("Class is required.");
        }

        ClassEntity classEntity = classRepository.findById(request.getClassId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found."));
        if (classEntity.getTeacherIds() == null || !classEntity.getTeacherIds().contains(teacher.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized for this class");
        }

        // Validate question types
        List<Question> questions = request.getQuestionIds().stream()
                .map(qId -> questionRepository.findById(qId).orElseThrow(() -> new IllegalArgumentException("Question not found: " + qId)))
                .collect(Collectors.toList());
        for (Question q : questions) {
            if (q.getType() == null || !SUPPORTED_QUIZ_TYPES.contains(q.getType())) {
                throw new IllegalArgumentException("Unsupported quiz question type: " + q.getType());
            }
            if (q.getOptions() == null || q.getOptions().isEmpty()) {
                throw new IllegalArgumentException("Quiz questions must have options.");
            }
        }

        Quiz quiz = new Quiz();
        quiz.setTeacherId(teacher.getId());
        quiz.setClassId(request.getClassId());
        quiz.setTitle(request.getTitle());
        quiz.setDescription(request.getDescription());
        quiz.setQuestionIds(request.getQuestionIds());
        quiz.setQuestionPointsMap(request.getQuestionPointsMap());
        quiz.setTimePerQuestionSec(request.getTimePerQuestionSec() != null && request.getTimePerQuestionSec() > 0 ? request.getTimePerQuestionSec() : 30);
        quiz.setSelfPacedEnabled(false);
        quiz.setSelfPacedCode(null);
        quiz.setPublishedAt(null);
        return quizRepository.save(quiz);
    }

    public List<Quiz> listTeacherQuizzes(String teacherId, String loginIdentity) {
        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(teacherId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return quizRepository.findByTeacherId(teacherId);
    }

    public Quiz getQuizForTeacher(String quizId, String loginIdentity) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(quiz.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return quiz;
    }

    public Quiz publishSelfPaced(String quizId, String loginIdentity) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(quiz.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }

        if (quiz.isSelfPacedEnabled() && quiz.getSelfPacedCode() != null && !quiz.getSelfPacedCode().isBlank()) {
            return quiz;
        }

        quiz.setSelfPacedEnabled(true);
        quiz.setSelfPacedCode(generateUniqueSelfPacedCode());
        quiz.setPublishedAt(Instant.now());
        return quizRepository.save(quiz);
    }

    public StartQuizSessionResponse startSession(String quizId, String loginIdentity) {
        Quiz quiz = quizRepository.findById(quizId).orElseThrow(() -> new RuntimeException("Quiz not found"));
        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(quiz.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }

        QuizSession session = new QuizSession();
        session.setQuizId(quiz.getId());
        session.setTeacherId(teacher.getId());
        session.setClassId(quiz.getClassId());
        session.setSessionCode(generateUniqueSessionCode());
        session.setStatus("LOBBY");
        session.setCurrentQuestionIndex(-1);
        session.setLocked(false);
        session.setRevision(1L);
        QuizSession saved = quizSessionRepository.save(session);

        return StartQuizSessionResponse.builder()
                .sessionId(saved.getId())
                .sessionCode(saved.getSessionCode())
                .build();
    }

    public StudentQuizDTO getQuizByCode(String code, String studentId) {
        requireStudent(studentId);
        Quiz quiz = quizRepository.findBySelfPacedCode(code)
                .orElseThrow(() -> new RuntimeException("Quiz not found for code: " + code));
        if (!quiz.isSelfPacedEnabled()) {
            throw new RuntimeException("Quiz is not available.");
        }

        List<StudentQuestionDTO> questions = quiz.getQuestionIds().stream()
                .map(qId -> {
                    Question q = questionRepository.findById(qId).orElse(null);
                    if (q == null) return null;
                    int marks = quiz.getQuestionPointsMap() != null ? quiz.getQuestionPointsMap().getOrDefault(qId, q.getPoints() != null ? q.getPoints() : 1) : (q.getPoints() != null ? q.getPoints() : 1);
                    return StudentQuestionDTO.builder()
                            .id(q.getId())
                            .subject(q.getSubjectId())
                            .grade(null)
                            .chapter(q.getChapter())
                            .topic(q.getTopic())
                            .type(q.getType())
                            .text(q.getText())
                            .options(q.getOptions())
                            .marks(marks)
                            .build();
                })
                .filter(q -> q != null)
                .collect(Collectors.toList());

        int total = questions.stream().mapToInt(q -> q.getMarks() == null ? 0 : q.getMarks()).sum();

        return StudentQuizDTO.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .timePerQuestionSec(quiz.getTimePerQuestionSec())
                .totalMarks(total)
                .questions(questions)
                .build();
    }

    private String generateUniqueSelfPacedCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        java.util.Random random = new java.util.Random();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (!quizRepository.existsBySelfPacedCode(code)) {
                return code;
            }
        }
        throw new RuntimeException("Failed to generate a unique quiz code. Please try again.");
    }

    private String generateUniqueSessionCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        java.util.Random random = new java.util.Random();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            if (!quizSessionRepository.existsBySessionCode(code)) {
                return code;
            }
        }
        throw new RuntimeException("Failed to generate a unique session code. Please try again.");
    }

    private User requireTeacher(String teacherId) {
        User user = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.TEACHER) {
            throw new org.springframework.security.access.AccessDeniedException("Teacher access required");
        }
        return user;
    }

    private void requireStudent(String studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new org.springframework.security.access.AccessDeniedException("Student access required");
        }
    }

    private User resolveTeacher(String loginIdentity) {
        return userRepository.findById(loginIdentity)
                .or(() -> userRepository.findByEmail(loginIdentity))
                .or(() -> {
                    List<User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? Optional.empty() : Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }
}

