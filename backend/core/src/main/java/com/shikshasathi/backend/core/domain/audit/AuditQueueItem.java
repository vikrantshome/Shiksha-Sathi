package com.shikshasathi.backend.core.domain.audit;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.Map;

@Data
@Document(collection = "audit_queue")
public class AuditQueueItem {
    @Id
    private String id;
    private String questionId;
    private Instant timestamp;
    private Map<String, Object> suggestedFix;
    private double confidence;
    private String status;
}