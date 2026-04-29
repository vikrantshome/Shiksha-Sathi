package com.shikshasathi.backend.api.dto;

import lombok.Data;

@Data
public class EnrollStudentRequest {
    private String name;
    private String phone;
    private String rollNumber;
}
