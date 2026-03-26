package com.shikshasathi.backend.api.dto.auth;

import lombok.Data;

@Data
public class AuthRequest {
    private String phone;
    private String password;
}
