package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "audit_jobs")
public class AuditJob extends BaseEntity {

    @Id
    private String id;

    @Field("class_level")
    private Integer classLevel;

    @Field("status")
    private String status; // RUNNING, COMPLETED, CANCELLED, FAILED

    @Field("started_at")
    private Instant startedAt;

    @Field("completed_at")
    private Instant completedAt;

    @Field("total_count")
    private Integer totalCount; // optional, total questions to audit

    @Field("processed_count")
    private Integer processedCount; // optional, how many processed so far

    @Field("audit_run_id")
    private String auditRunId; // same identifier used in AuditResult documents

    @Field("stdout")
    private String stdout;

    @Field("stderr")
    private String stderr;
}
