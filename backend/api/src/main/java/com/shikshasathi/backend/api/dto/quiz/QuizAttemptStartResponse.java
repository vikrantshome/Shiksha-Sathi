package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizAttemptStartResponse {
    private String attemptId;
}

