package com.shikshasathi.backend.api.dto.audit;

import lombok.Data;

@Data
public class AuditStatsDTO {
    private long totalInvalidQuestions;
    private long pendingReview;
    private long autoApplied;
    private long manualReviewNeeded;
}