package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.audit.*;
import com.shikshasathi.backend.core.domain.audit.AuditLog;
import com.shikshasathi.backend.core.domain.audit.AuditQueueItem;
import com.shikshasathi.backend.infrastructure.repository.audit.AuditLogRepository;
import com.shikshasathi.backend.infrastructure.repository.audit.AuditQueueItemRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditService {
    private final AuditLogRepository auditLogRepository;
    private final AuditQueueItemRepository auditQueueItemRepository;
    private final QuestionRepository questionRepository;
    private final MongoTemplate mongoTemplate;

    public AuditStatsDTO getStats() {
        AuditStatsDTO stats = new AuditStatsDTO();
        stats.setPendingReview(auditQueueItemRepository.findByStatus("pending").size());
        stats.setAutoApplied(auditLogRepository.count());
        return stats;
    }

    public String runAudit(AuditRequestDTO request) {
        return "Audit feature coming soon";
    }

    public List<AuditQueueItemDTO> getReviewQueue() {
        List<AuditQueueItem> items = auditQueueItemRepository.findByStatus("pending");
        return items.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public void approveFix(String queueItemId) {
        AuditQueueItem item = auditQueueItemRepository.findById(queueItemId).orElse(null);
        if (item == null) return;

        item.setStatus("approved");
        auditQueueItemRepository.save(item);
    }

    public void rejectFix(String queueItemId) {
        AuditQueueItem item = auditQueueItemRepository.findById(queueItemId).orElse(null);
        if (item == null) return;

        item.setStatus("rejected");
        auditQueueItemRepository.save(item);
    }

    private AuditQueueItemDTO convertToDTO(AuditQueueItem item) {
        AuditQueueItemDTO dto = new AuditQueueItemDTO();
        dto.setId(item.getId());
        dto.setQuestionId(item.getQuestionId());
        dto.setSuggestedFix(item.getSuggestedFix());
        dto.setConfidence(item.getConfidence());
        dto.setStatus(item.getStatus());

        questionRepository.findById(item.getQuestionId()).ifPresent(q -> {
            dto.setQuestionText(q.getText());
            dto.setOriginalType(q.getType());
        });

        return dto;
    }
}