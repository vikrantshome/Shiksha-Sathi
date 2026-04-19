package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.AuditResultService;
import com.shikshasathi.backend.core.domain.learning.AuditResult;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/audit-results")
public class AuditResultController {

    @Autowired
    private AuditResultService auditResultService;

    /**
     * Get audit results with optional filtering.
     */
    @GetMapping
    public ResponseEntity<List<AuditResult>> getAuditResults(
            @RequestParam(required = false) Integer classLevel,
            @RequestParam(required = false) String chapter,
            @RequestParam(required = false) String status) {

        return ResponseEntity.ok(auditResultService.getAuditResults(classLevel, chapter, status));
    }

    /**
     * Get audit statistics.
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics(
            @RequestParam(required = false) Integer classLevel,
            @RequestParam(required = false) String chapter) {

        return ResponseEntity.ok(auditResultService.getStatistics(classLevel, chapter));
    }

    /**
     * Apply fix to a single question.
     */
    @PostMapping("/apply-fix")
    public ResponseEntity<Question> applyFix(
            @RequestBody Map<String, String> request) {

        String questionId = request.get("questionId");
        String appliedBy = request.getOrDefault("appliedBy", "admin");

        if (questionId == null || questionId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            return ResponseEntity.ok(auditResultService.applyFix(questionId, appliedBy));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reject a question.
     */
    @PostMapping("/reject")
    public ResponseEntity<Question> rejectQuestion(
            @RequestBody Map<String, String> request) {

        String questionId = request.get("questionId");
        String reason = request.getOrDefault("reason", "Rejected via audit");

        if (questionId == null || questionId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            return ResponseEntity.ok(auditResultService.rejectQuestion(questionId, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Bulk apply fixes.
     */
    @PostMapping("/bulk-apply-fix")
    public ResponseEntity<Map<String, Object>> bulkApplyFixes(
            @RequestBody Map<String, Object> request) {

        @SuppressWarnings("unchecked")
        List<String> questionIds = (List<String>) request.get("questionIds");
        String appliedBy = (String) request.getOrDefault("appliedBy", "admin");

        if (questionIds == null || questionIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        int count = auditResultService.bulkApplyFixes(questionIds, appliedBy);
        return ResponseEntity.ok(Map.of("appliedCount", count, "status", "SUCCESS"));
    }

    /**
     * Bulk reject questions.
     */
    @PostMapping("/bulk-reject")
    public ResponseEntity<Map<String, Object>> bulkReject(
            @RequestBody Map<String, Object> request) {

        @SuppressWarnings("unchecked")
        List<String> questionIds = (List<String>) request.get("questionIds");
        String reason = (String) request.getOrDefault("reason", "Bulk rejected via audit");

        if (questionIds == null || questionIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        int count = auditResultService.bulkReject(questionIds, reason);
        return ResponseEntity.ok(Map.of("rejectedCount", count, "status", "SUCCESS"));
    }

    /**
     * Delete audit results by run ID.
     */
    @DeleteMapping("/run/{runId}")
    public ResponseEntity<Map<String, String>> deleteByRunId(@PathVariable String runId) {
        auditResultService.deleteByAuditRunId(runId);
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "deletedRunId", runId));
    }
}