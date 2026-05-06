package com.shikshasathi.backend.infrastructure.repository.audit;

import com.shikshasathi.backend.core.domain.audit.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByQuestionId(String questionId);
}