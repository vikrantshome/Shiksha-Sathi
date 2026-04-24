package com.shikshasathi.backend.api.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileRequest {
    private String name;
    private String email;
    private String phone;
    private String birthDate;
    private String rollNumber;
    private String studentClass;
    private String section;
    private String school;
}
