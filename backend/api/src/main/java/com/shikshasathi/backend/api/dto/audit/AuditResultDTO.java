package com.shikshasathi.backend.api.dto.audit;

import lombok.Data;
import java.util.Map;

@Data
public class AuditResultDTO {
    private String questionId;
    private String originalType;
    private String suggestedType;
    private double confidence;
    private Map<String, Object> suggestedFix;
    private boolean autoApplied;
}