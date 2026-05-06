package com.shikshasathi.backend.core.domain.audit;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "question_audits")
public class AuditLog {
    @Id
    private String id;
    private String questionId;
    private Instant timestamp;
    private List<FieldChange> fieldChanges;
    private double confidence;
    private String source;
    private boolean webVerified;
    private boolean manualReviewNeeded;

    @Data
    public static class FieldChange {
        private String field;
        private Object oldValue;
        private Object newValue;
    }
}