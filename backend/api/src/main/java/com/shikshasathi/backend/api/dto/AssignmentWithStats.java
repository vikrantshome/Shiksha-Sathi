package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;

@Data
@Builder
public class AssignmentWithStats {
    private String id;
    private String title;
    private String className;
    private Instant dueDate;
    private Integer totalMarks;
    private Integer maxScore;
    private String linkId;
    private String code; // Short 6-char code for student entry
    private long submissionCount;
    private double averageScore;
}
