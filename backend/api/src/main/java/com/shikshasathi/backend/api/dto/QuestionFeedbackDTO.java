package com.shikshasathi.backend.api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    /** True when AI grading failed and this question awaits manual/AI review. */
    @JsonProperty("aiGradingFailed")
    private boolean aiGradingFailed;
    /** Explanation for the question (from the Question entity). */
    private String explanation;
}
