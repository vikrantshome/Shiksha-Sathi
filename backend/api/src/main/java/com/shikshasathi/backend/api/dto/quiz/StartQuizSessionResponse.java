package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StartQuizSessionResponse {
    private String sessionId;
    private String sessionCode;
}

