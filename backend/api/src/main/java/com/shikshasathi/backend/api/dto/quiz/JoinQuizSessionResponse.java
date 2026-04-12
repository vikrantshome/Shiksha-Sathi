package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class JoinQuizSessionResponse {
    private String sessionId;
    private String sessionCode;
    private String status;
}

