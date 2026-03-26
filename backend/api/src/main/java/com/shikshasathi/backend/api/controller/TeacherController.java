package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.teacher.ProfileRequest;
import com.shikshasathi.backend.api.dto.teacher.ProfileResponse;
import com.shikshasathi.backend.api.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/teachers")
@RequiredArgsConstructor
public class TeacherController {

    private final ProfileService profileService;

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(profileService.getProfile(username));
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@Valid @RequestBody ProfileRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(profileService.updateProfile(username, request));
    }
}
