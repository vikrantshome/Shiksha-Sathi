package com.shikshasathi.backend.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionFeedbackDTO {
    private String questionId;
    private String questionText;
    private String studentAnswer;
    private String correctAnswer;
    @JsonProperty("isCorrect")
    private boolean isCorrect;
    private Integer marksAwarded;
    /** AI-provided reasoning for the grade (null for exact-match grading). */
    private String reasoning;
    /** AI confidence score from 0.0 to 1.0 (null for exact-match grading). */
    private Double confidence;
}
