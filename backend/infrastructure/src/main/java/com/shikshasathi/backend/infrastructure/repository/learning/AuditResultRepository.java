package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.AuditResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditResultRepository extends MongoRepository<AuditResult, String> {

    List<AuditResult> findByClassLevel(Integer classLevel);

    List<AuditResult> findByClassLevelAndChapter(Integer classLevel, String chapter);

    List<AuditResult> findByAuditStatus(String auditStatus);

    List<AuditResult> findByClassLevelAndAuditStatus(Integer classLevel, String auditStatus);

    List<AuditResult> findByQuestionId(String questionId);

    Optional<AuditResult> findTopByQuestionIdOrderByAuditedAtDesc(String questionId);

    long countByClassLevel(Integer classLevel);

    long countByClassLevelAndAuditStatus(Integer classLevel, String auditStatus);

    long countByAuditStatus(String auditStatus);

    void deleteByClassLevel(Integer classLevel);

    void deleteByAuditRunId(String auditRunId);
}
