package com.shikshasathi.backend.api.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Parsed JSON response from the AI grading agent on Hugging Face Spaces.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AIGradingResponse {
    private double marksAwarded;
    private int maxMarks;
    @JsonProperty("isCorrect")
    private boolean isCorrect;
    private String reasoning;
    private double confidence;
}
