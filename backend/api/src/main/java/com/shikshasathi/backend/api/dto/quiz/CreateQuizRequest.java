package com.shikshasathi.backend.api.dto.quiz;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class CreateQuizRequest {
    private String title;
    private String description;
    private String classId;
    private List<String> questionIds;
    private Map<String, Integer> questionPointsMap;
    private Integer timePerQuestionSec;
}

