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
    private String linkId;
    private long submissionCount;
    private double averageScore;
}
