package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.AssignmentSubmissionService;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/submissions")
@RequiredArgsConstructor
public class AssignmentSubmissionController {

    private final AssignmentSubmissionService submissionService;

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<List<AssignmentSubmission>> getByAssignment(@PathVariable String assignmentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AssignmentSubmission>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(studentId));
    }

    @PostMapping
    public ResponseEntity<AssignmentSubmission> submitAssignment(@RequestBody AssignmentSubmission submission) {
        return ResponseEntity.ok(submissionService.submitAssignment(submission));
    }
}
