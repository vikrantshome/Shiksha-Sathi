package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionFeedbackDTO {
    private String questionId;
    private String questionText;
    private String studentAnswer;
    private String correctAnswer;
    private boolean isCorrect;
    private Integer marksAwarded;
}
