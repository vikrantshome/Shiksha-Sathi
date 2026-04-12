package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizAnswerResponse {
    private boolean accepted;
    private boolean correct;
    private int pointsAwarded;
    private int newScore;
}

