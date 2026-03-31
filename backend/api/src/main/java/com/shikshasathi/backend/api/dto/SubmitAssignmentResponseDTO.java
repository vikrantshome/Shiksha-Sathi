package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SubmitAssignmentResponseDTO {
    private boolean success;
    private int score;
    private int totalMarks;
    private List<QuestionFeedbackDTO> feedback;
}
