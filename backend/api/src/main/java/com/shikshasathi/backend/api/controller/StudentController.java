package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.StudentService;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/me/classes")
    public ResponseEntity<List<ClassEntity>> getMyEnrolledClasses() {
        String studentId = getStudentId();
        return ResponseEntity.ok(studentService.getEnrolledClasses(studentId));
    }

    @GetMapping("/me/assignments/pending")
    public ResponseEntity<List<Assignment>> getMyPendingAssignments() {
        String studentId = getStudentId();
        return ResponseEntity.ok(studentService.getPendingAssignments(studentId));
    }

    @GetMapping("/me/assignments/submitted")
    public ResponseEntity<List<AssignmentSubmission>> getMySubmittedAssignments() {
        String studentId = getStudentId();
        return ResponseEntity.ok(studentService.getSubmittedAssignments(studentId));
    }

    @GetMapping("/me/quizzes/pending")
    public ResponseEntity<List<Quiz>> getMyPendingQuizzes() {
        String studentId = getStudentId();
        return ResponseEntity.ok(studentService.getPendingQuizzes(studentId));
    }

    @GetMapping("/me/quizzes/submitted")
    public ResponseEntity<List<QuizAttempt>> getMySubmittedQuizzes() {
        String studentId = getStudentId();
        return ResponseEntity.ok(studentService.getSubmittedQuizzes(studentId));
    }

    private String getStudentId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}