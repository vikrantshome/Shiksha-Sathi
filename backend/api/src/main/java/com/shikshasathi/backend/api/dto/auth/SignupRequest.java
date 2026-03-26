package com.shikshasathi.backend.api.dto.auth;

import com.shikshasathi.backend.core.domain.user.Role;
import lombok.Data;

@Data
public class SignupRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Role role;
}
