package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.SubmitAssignmentResponseDTO;
import com.shikshasathi.backend.api.dto.quiz.QuizAttemptStartRequest;
import com.shikshasathi.backend.api.dto.quiz.QuizAttemptStartResponse;
import com.shikshasathi.backend.api.dto.quiz.QuizAttemptSubmitRequest;
import com.shikshasathi.backend.api.service.QuizAttemptService;
import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import com.shikshasathi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quiz-attempts")
@RequiredArgsConstructor
public class QuizAttemptController {

    private final QuizAttemptService quizAttemptService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<QuizAttemptStartResponse> startAttempt(
            @RequestBody QuizAttemptStartRequest request,
            @RequestHeader("Authorization") String authorization
    ) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        QuizAttempt attempt = quizAttemptService.startAttempt(request.getQuizId(), studentId);
        return ResponseEntity.ok(QuizAttemptStartResponse.builder().attemptId(attempt.getId()).build());
    }

    @PostMapping("/{attemptId}/submit")
    public ResponseEntity<SubmitAssignmentResponseDTO> submitAttempt(
            @PathVariable String attemptId,
            @RequestBody QuizAttemptSubmitRequest request,
            @RequestHeader("Authorization") String authorization
    ) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        return ResponseEntity.ok(quizAttemptService.submitAttempt(attemptId, studentId, request.getAnswers()));
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<Object> getAttemptDetails(@PathVariable String attemptId) {
        return ResponseEntity.ok(quizAttemptService.getAttemptDetails(attemptId));
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

