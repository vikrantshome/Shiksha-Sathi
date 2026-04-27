package com.shikshasathi.backend.api.dto;

import lombok.Data;

@Data
public class GradeUpdateRequest {
    private String studentId;
    private String questionId;
    private int score;
}
