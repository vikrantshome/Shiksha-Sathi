package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.audit.*;
import com.shikshasathi.backend.api.service.AuditService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditService auditService;

    @PostMapping("/run")
    public ResponseEntity<String> runAudit(@RequestBody AuditRequestDTO request) {
        try {
            String result = auditService.runAudit(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditStatsDTO> getStats() {
        return ResponseEntity.ok(auditService.getStats());
    }

    @GetMapping("/queue")
    public ResponseEntity<List<AuditQueueItemDTO>> getReviewQueue() {
        return ResponseEntity.ok(auditService.getReviewQueue());
    }

    @PostMapping("/approve/{queueItemId}")
    public ResponseEntity<Void> approveFix(@PathVariable String queueItemId) {
        auditService.approveFix(queueItemId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reject/{queueItemId}")
    public ResponseEntity<Void> rejectFix(@PathVariable String queueItemId) {
        auditService.rejectFix(queueItemId);
        return ResponseEntity.ok().build();
    }
}