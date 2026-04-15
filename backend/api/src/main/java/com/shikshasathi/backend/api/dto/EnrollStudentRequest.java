package com.shikshasathi.backend.api.dto;

import lombok.Data;

@Data
public class EnrollStudentRequest {
    private String name;
    private String phone;
    /**
     * Student's date of birth in DD-MM-YYYY format.
     * This becomes the student's default password.
     */
    private String birthDate;
    private String rollNumber;
}
