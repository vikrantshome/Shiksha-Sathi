package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizQuestionStatDTO {
    private int questionIndex;
    private String questionId;
    private String text;
    private int totalResponses;
    private int correctResponses;
}

