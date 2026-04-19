package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Document(collection = "audit_results")
public class AuditResult extends BaseEntity {

    @Id
    private String id;

    @Field("question_id")
    private String questionId;

    @Field("class_level")
    private Integer classLevel;

    @Field("chapter")
    private String chapter;

    @Field("subject")
    private String subject;

    @Field("audit_status")
    private String auditStatus; // "ok", "needs_fix", "error"

    @Field("issues")
    private List<String> issues;

    @Field("auto_fixes")
    private Map<String, Object> autoFixes;

    @Field("recommendation")
    private String recommendation; // "approve", "needs_review", "reject"

    @Field("db_status")
    private String dbStatus; // Original DB status: DRAFT, PUBLISHED, REVIEW, REJECTED

    @Field("question_text")
    private String questionText;

    @Field("question_type")
    private String questionType;

    @Field("correct_answer")
    private String correctAnswer;

    @Field("question_options")
    private List<String> questionOptions;

    @Field("explanation")
    private String explanation;

    @Field("audited_at")
    private Instant auditedAt;

    @Field("applied_at")
    private Instant appliedAt;

    @Field("applied_by")
    private String appliedBy;

    @Field("audit_run_id")
    private String auditRunId;
}
