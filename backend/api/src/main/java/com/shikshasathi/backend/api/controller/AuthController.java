package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.auth.AuthRequest;
import com.shikshasathi.backend.api.dto.auth.AuthResponse;
import com.shikshasathi.backend.api.dto.auth.SignupRequest;
import com.shikshasathi.backend.api.dto.auth.UpdateProfileRequest;
import com.shikshasathi.backend.api.dto.auth.UserResponse;
import com.shikshasathi.backend.api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(authService.getCurrentUser(username));
    }

    @PutMapping("/me")
    public ResponseEntity<UserResponse> updateMe(@RequestBody UpdateProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(authService.updateCurrentUser(username, request));
    }
}
