package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizAttemptRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final ClassRepository classRepository;
    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public List<ClassEntity> getEnrolledClasses(String studentId) {
        return classRepository.findByStudentIdsContaining(studentId);
    }

    public List<Assignment> getPendingAssignments(String studentId) {
        List<ClassEntity> enrolledClasses = classRepository.findByStudentIdsContaining(studentId);
        
        if (enrolledClasses == null || enrolledClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> classIds = enrolledClasses.stream()
                .filter(c -> c.isActive())
                .map(c -> c.getId())
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Assignment> classAssignments = new ArrayList<>();
        for (String classId : classIds) {
            List<Assignment> assignments = assignmentRepository.findByClassId(classId);
            if (assignments != null) {
                classAssignments.addAll(assignments);
            }
        }

        List<String> submittedAssignmentIds = assignmentSubmissionRepository.findByStudentId(studentId).stream()
                .map(s -> s.getAssignmentId())
                .collect(Collectors.toList());

        return classAssignments.stream()
                .filter(a -> !submittedAssignmentIds.contains(a.getId()))
                .filter(a -> "PUBLISHED".equals(a.getStatus()))
                .collect(Collectors.toList());
    }

    public List<AssignmentSubmission> getSubmittedAssignments(String studentId) {
        return assignmentSubmissionRepository.findByStudentId(studentId);
    }

    public List<Quiz> getPendingQuizzes(String studentId) {
        List<ClassEntity> enrolledClasses = classRepository.findByStudentIdsContaining(studentId);
        
        if (enrolledClasses == null || enrolledClasses.isEmpty()) {
            return new ArrayList<>();
        }

        List<String> classIds = enrolledClasses.stream()
                .filter(c -> c.isActive())
                .map(c -> c.getId())
                .collect(Collectors.toList());

        if (classIds.isEmpty()) {
            return new ArrayList<>();
        }

        List<Quiz> classQuizzes = new ArrayList<>();
        for (String classId : classIds) {
            List<Quiz> quizzes = quizRepository.findByClassId(classId);
            if (quizzes != null) {
                classQuizzes.addAll(quizzes);
            }
        }

        List<String> attemptedQuizIds = quizAttemptRepository.findByStudentId(studentId).stream()
                .map(a -> a.getQuizId())
                .collect(Collectors.toList());

        return classQuizzes.stream()
                .filter(q -> !attemptedQuizIds.contains(q.getId()))
                .filter(q -> q.getPublishedAt() != null)
                .collect(Collectors.toList());
    }

    public List<QuizAttempt> getSubmittedQuizzes(String studentId) {
        return quizAttemptRepository.findByStudentId(studentId);
    }
}