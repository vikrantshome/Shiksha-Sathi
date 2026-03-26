package com.shikshasathi.backend.api.dto.auth;

import lombok.Data;

@Data
public class AuthRequest {
    private String email;
    private String phone;
    private String password;
}
