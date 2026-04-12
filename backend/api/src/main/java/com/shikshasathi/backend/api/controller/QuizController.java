package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.quiz.CreateQuizRequest;
import com.shikshasathi.backend.api.dto.quiz.StartQuizSessionResponse;
import com.shikshasathi.backend.api.dto.quiz.StudentQuizDTO;
import com.shikshasathi.backend.api.service.QuizService;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(
            @RequestBody CreateQuizRequest request,
            @RequestHeader("Authorization") String authorization
    ) {
        String teacherId = currentUserIdFromAuthHeader(authorization);
        return ResponseEntity.ok(quizService.createQuiz(request, teacherId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Quiz>> listTeacherQuizzes(@PathVariable String teacherId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizService.listTeacherQuizzes(teacherId, loginIdentity));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable String quizId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizService.getQuizForTeacher(quizId, loginIdentity));
    }

    @PostMapping("/{quizId}/publish-self-paced")
    public ResponseEntity<Quiz> publishSelfPaced(@PathVariable String quizId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizService.publishSelfPaced(quizId, loginIdentity));
    }

    @PostMapping("/{quizId}/start-session")
    public ResponseEntity<StartQuizSessionResponse> startSession(@PathVariable String quizId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizService.startSession(quizId, loginIdentity));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<StudentQuizDTO> getByCode(
            @PathVariable String code,
            @RequestHeader("Authorization") String authorization
    ) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        return ResponseEntity.ok(quizService.getQuizByCode(code, studentId));
    }

    private String currentUserIdFromAuthHeader(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing Authorization header");
        }
        String token = authorization.substring(7);
        String userId = jwtUtil.extractUserId(token);
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("Invalid Authorization token");
        }
        return userId;
    }
}

