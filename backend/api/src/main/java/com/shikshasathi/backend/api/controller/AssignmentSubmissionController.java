package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.api.dto.SubmitAssignmentResponseDTO;
import com.shikshasathi.backend.api.service.AssignmentSubmissionService;
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
    public ResponseEntity<List<SubmissionDTO>> getByAssignment(@PathVariable String assignmentId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(submissionService.getSubmissionsForAssignment(assignmentId, email));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<SubmissionDTO>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(submissionService.getSubmissionsForStudent(studentId));
    }

    /**
     * Get a single submission with full AI-graded feedback for results display.
     */
    @GetMapping("/{submissionId}")
    public ResponseEntity<SubmissionDTO> getById(@PathVariable String submissionId) {
        return ResponseEntity.ok(submissionService.getSubmissionWithFeedback(submissionId));
    }

    @PostMapping
    public ResponseEntity<SubmitAssignmentResponseDTO> submitAssignment(@RequestBody com.shikshasathi.backend.core.domain.learning.AssignmentSubmission submission) {
        return ResponseEntity.ok(submissionService.submitAssignment(submission));
    }
}
