package com.shikshasathi.backend.api.dto.auth;

import com.shikshasathi.backend.core.domain.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String email; // Optional

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "\\d{10}", message = "Phone must be exactly 10 digits")
    private String phone;

    private String password;

    @NotBlank(message = "School is required")
    private String school; // School/Institute name (required)

    // Student-specific fields (required when role = STUDENT)
    private String rollNumber;
    private String studentClass; // Class/Grade (e.g., "8")
    private String section;      // Section/Division (e.g., "A")

    private Role role;
}
