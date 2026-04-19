package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.AuditJobService;
import com.shikshasathi.backend.core.domain.learning.AuditJob;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@RequiredArgsConstructor
public class AuditJobController {

    private final AuditJobService auditJobService;

    /**
     * Start a new audit job for a specific class.
     * Expected JSON body: { "classLevel": 9 }
     */
    @PostMapping("/run")
    public ResponseEntity<AuditJob> runAudit(@RequestBody RunAuditRequest request) {
        if (request == null || request.getClassLevel() == null) {
            return ResponseEntity.badRequest().build();
        }
        AuditJob job = auditJobService.startJob(request.getClassLevel());
        return ResponseEntity.ok(job);
    }

    @GetMapping("/jobs")
    public ResponseEntity<List<AuditJob>> getAllJobs() {
        List<AuditJob> jobs = auditJobService.getAllJobs();
        return ResponseEntity.ok(jobs);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<AuditJob> getJob(@PathVariable String id) {
        AuditJob job = auditJobService.getJob(id);
        return job != null ? ResponseEntity.ok(job) : ResponseEntity.notFound().build();
    }

    @PostMapping("/jobs/{id}/cancel")
    public ResponseEntity<Void> cancelJob(@PathVariable String id) {
        auditJobService.cancelJob(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable String id) {
        auditJobService.deleteJob(id);
        return ResponseEntity.ok().build();
    }

    // Simple DTO for request body
    public static class RunAuditRequest {
        private Integer classLevel;
        public Integer getClassLevel() { return classLevel; }
        public void setClassLevel(Integer classLevel) { this.classLevel = classLevel; }
    }
}
