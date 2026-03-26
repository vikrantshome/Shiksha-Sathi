package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.Map;

@Data
@Builder
public class SubmissionDTO {
    private String id;
    private String assignmentId;
    private String studentId;
    private String studentName;
    private String studentRollNumber;
    private Map<String, Object> answers;
    private Integer score;
    private Instant submittedAt;
    private String status;
}
