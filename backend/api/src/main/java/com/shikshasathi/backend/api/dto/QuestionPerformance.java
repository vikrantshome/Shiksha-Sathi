package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuestionPerformance {
    private String questionId;
    private String text;
    private String topic;
    private Integer marks;
    private int correctPercentage;
}
