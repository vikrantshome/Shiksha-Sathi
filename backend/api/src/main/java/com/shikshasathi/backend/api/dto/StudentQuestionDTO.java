package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentQuestionDTO {
    private String id;
    private String subject;
    private String grade;
    private String chapter;
    private String topic;
    private String type;
    private String text;
    private List<String> options;
    private Integer marks;
}
