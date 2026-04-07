package com.shikshasathi.backend.api.dto.auth;

import com.shikshasathi.backend.core.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String userId;
    private String name;
    private String school;
    private Role role;
}
