package com.shikshasathi.backend.infrastructure.repository.audit;

import com.shikshasathi.backend.core.domain.audit.AuditQueueItem;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface AuditQueueItemRepository extends MongoRepository<AuditQueueItem, String> {
    List<AuditQueueItem> findByStatus(String status);
}