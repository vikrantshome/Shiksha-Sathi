package com.shikshasathi.backend.api.dto.quiz;

import lombok.Data;

import java.util.Map;

@Data
public class QuizAttemptSubmitRequest {
    private Map<String, String> answers;
}

