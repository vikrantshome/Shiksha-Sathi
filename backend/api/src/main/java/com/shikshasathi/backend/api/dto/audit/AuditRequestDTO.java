package com.shikshasathi.backend.api.dto.audit;

import lombok.Data;

@Data
public class AuditRequestDTO {
    private String mode;
    private String questionId;
    private String fixMode;
    private Integer classLevel;
    private String subject;
    private Integer limit;
}