package com.shikshasathi.backend.api.dto.auth;

import com.shikshasathi.backend.core.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String school;
    private Role role;

    /**
     * When multiple active users share the same phone (e.g., sibling students),
     * this field contains the candidate profiles for the frontend to show a picker.
     * Null for normal single-user login.
     */
    private List<CandidateProfile> candidates;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CandidateProfile {
        private String userId;
        private String name;
        private String school;
        private Role role;
        private String studentClass;
        private String section;
        private String rollNumber;
    }
}
