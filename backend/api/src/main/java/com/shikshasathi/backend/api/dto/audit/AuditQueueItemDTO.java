package com.shikshasathi.backend.api.dto.audit;

import lombok.Data;
import java.util.Map;

@Data
public class AuditQueueItemDTO {
    private String id;
    private String questionId;
    private String questionText;
    private String originalType;
    private Map<String, Object> suggestedFix;
    private double confidence;
    private String status;
}