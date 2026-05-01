package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizAttemptRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final ClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final UserRepository userRepository;

    private List<String> getStudentIdentifiers(String loginIdentity) {
        List<String> ids = new ArrayList<>();
        ids.add(loginIdentity);

        userRepository.findById(loginIdentity).ifPresent(user -> {
            if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
                ids.add(user.getRollNumber());
            }
        });

        userRepository.findByEmail(loginIdentity).ifPresent(user -> {
            ids.add(user.getId());
            if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
                ids.add(user.getRollNumber());
            }
        });

        for (User user : userRepository.findByPhone(loginIdentity)) {
            ids.add(user.getId());
            if (user.getRollNumber() != null && !user.getRollNumber().isBlank()) {
                ids.add(user.getRollNumber());
            }
        }

        return ids;
    }

    public List<ClassEntity> getEnrolledClasses(String studentId) {
        return classRepository.findByStudentIdsContaining(studentId);
    }

    public List<Assignment> getPendingAssignments(String studentId) {
        List<String> ids = getStudentIdentifiers(studentId);

        List<ClassEntity> enrolledClasses = classRepository.findByStudentIdsContaining(studentId);
        if (enrolledClasses == null || enrolledClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> classIds = enrolledClasses.stream()
                .filter(ClassEntity::isActive)
                .map(ClassEntity::getId)
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }

        // Batch fetch all assignments for all classes instead of N queries
        List<Assignment> classAssignments = assignmentRepository.findByClassIdIn(classIds);

        // Batch fetch all submissions for all student identifiers
        Set<String> submittedIds = new HashSet<>();
        for (String id : ids) {
            assignmentSubmissionRepository.findByStudentId(id).forEach(s -> submittedIds.add(s.getAssignmentId()));
            assignmentSubmissionRepository.findByStudentRollNumber(id).forEach(s -> submittedIds.add(s.getAssignmentId()));
        }

        return classAssignments.stream()
                .filter(a -> !submittedIds.contains(a.getId()))
                .filter(a -> "PUBLISHED".equals(a.getStatus()))
                .collect(Collectors.toList());
    }

    public List<AssignmentSubmission> getSubmittedAssignments(String studentId) {
        List<String> ids = getStudentIdentifiers(studentId);
        Set<String> seen = new HashSet<>();
        List<AssignmentSubmission> result = new ArrayList<>();
        for (String id : ids) {
            assignmentSubmissionRepository.findByStudentId(id).forEach(s -> {
                if (seen.add(s.getId())) result.add(s);
            });
            assignmentSubmissionRepository.findByStudentRollNumber(id).forEach(s -> {
                if (seen.add(s.getId())) result.add(s);
            });
        }
        return result;
    }

    public List<Quiz> getPendingQuizzes(String studentId) {
        List<ClassEntity> enrolledClasses = classRepository.findByStudentIdsContaining(studentId);
        if (enrolledClasses == null || enrolledClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> classIds = enrolledClasses.stream()
                .filter(ClassEntity::isActive)
                .map(ClassEntity::getId)
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }

        // Batch fetch all quizzes for all classes instead of N queries
        List<Quiz> classQuizzes = quizRepository.findByClassIdIn(classIds);

        List<String> ids = getStudentIdentifiers(studentId);
        Set<String> attemptedIds = new HashSet<>();
        for (String id : ids) {
            quizAttemptRepository.findByStudentId(id).forEach(a -> attemptedIds.add(a.getQuizId()));
            quizAttemptRepository.findByStudentRollNumber(id).forEach(a -> attemptedIds.add(a.getQuizId()));
        }

        return classQuizzes.stream()
                .filter(q -> !attemptedIds.contains(q.getId()))
                .filter(q -> q.getPublishedAt() != null)
                .collect(Collectors.toList());
    }

    public List<QuizAttempt> getSubmittedQuizzes(String studentId) {
        List<String> ids = getStudentIdentifiers(studentId);
        Set<String> seen = new HashSet<>();
        List<QuizAttempt> result = new ArrayList<>();
        for (String id : ids) {
            quizAttemptRepository.findByStudentId(id).forEach(a -> {
                if (seen.add(a.getId())) result.add(a);
            });
            quizAttemptRepository.findByStudentRollNumber(id).forEach(a -> {
                if (seen.add(a.getId())) result.add(a);
            });
        }
        return result;
    }
}
