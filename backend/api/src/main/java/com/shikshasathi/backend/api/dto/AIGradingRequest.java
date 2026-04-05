package com.shikshasathi.backend.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request payload sent to the AI grading agent on Hugging Face Spaces.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIGradingRequest {
    private String question;
    private String expectedAnswer;
    private String studentAnswer;
    private int maxMarks;
}
