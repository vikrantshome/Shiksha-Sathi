package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.quiz.*;
import com.shikshasathi.backend.api.service.QuizSessionService;
import com.shikshasathi.backend.core.domain.learning.QuizSession;
import com.shikshasathi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/quiz-sessions")
@RequiredArgsConstructor
public class QuizSessionController {

    private final QuizSessionService quizSessionService;
    private final JwtUtil jwtUtil;

    @PostMapping("/join")
    public ResponseEntity<JoinQuizSessionResponse> join(@RequestBody JoinQuizSessionRequest request,
                                                        @RequestHeader("Authorization") String authorization) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        return ResponseEntity.ok(quizSessionService.joinSession(request.getSessionCode(), studentId));
    }

    @GetMapping("/{sessionId}/state")
    public ResponseEntity<StudentQuizSessionStateDTO> state(@PathVariable String sessionId,
                                                            @RequestHeader("Authorization") String authorization,
                                                            @RequestParam(value = "sinceRevision", required = false) Long sinceRevision) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        StudentQuizSessionStateDTO state = quizSessionService.getStudentState(sessionId, studentId);
        if (sinceRevision != null && state.getRevision() <= sinceRevision) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{sessionId}/answer")
    public ResponseEntity<QuizAnswerResponse> answer(@PathVariable String sessionId,
                                                     @RequestBody QuizAnswerRequest request,
                                                     @RequestHeader("Authorization") String authorization) {
        String studentId = currentUserIdFromAuthHeader(authorization);
        return ResponseEntity.ok(quizSessionService.submitAnswer(sessionId, studentId, request.getAnswer()));
    }

    @GetMapping("/{sessionId}/teacher-state")
    public ResponseEntity<TeacherQuizSessionStateDTO> teacherState(@PathVariable String sessionId,
                                                                   @RequestParam(value = "sinceRevision", required = false) Long sinceRevision) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        TeacherQuizSessionStateDTO state = quizSessionService.getTeacherState(sessionId, loginIdentity);
        if (sinceRevision != null && state.getRevision() <= sinceRevision) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{sessionId}/lock")
    public ResponseEntity<QuizSession> lock(@PathVariable String sessionId, @RequestBody LockQuizSessionRequest request) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.lockSession(sessionId, loginIdentity, request.isLocked()));
    }

    @PostMapping("/{sessionId}/start")
    public ResponseEntity<QuizSession> start(@PathVariable String sessionId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.startSession(sessionId, loginIdentity));
    }

    @PostMapping("/{sessionId}/reveal")
    public ResponseEntity<QuizSession> reveal(@PathVariable String sessionId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.reveal(sessionId, loginIdentity));
    }

    @PostMapping("/{sessionId}/next")
    public ResponseEntity<QuizSession> next(@PathVariable String sessionId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.next(sessionId, loginIdentity));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<QuizSession> end(@PathVariable String sessionId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.end(sessionId, loginIdentity));
    }

    @GetMapping("/{sessionId}/report")
    public ResponseEntity<QuizSessionReportDTO> report(@PathVariable String sessionId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(quizSessionService.report(sessionId, loginIdentity));
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

