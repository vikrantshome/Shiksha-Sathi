package com.shikshasathi.backend.api.dto.auth;

import com.shikshasathi.backend.core.domain.user.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    // Student-specific fields
    private String rollNumber;
    private String studentClass; // Class/Grade (e.g., "8")
    private String section;      // Section/Division (e.g., "A")
    private String school;
}
