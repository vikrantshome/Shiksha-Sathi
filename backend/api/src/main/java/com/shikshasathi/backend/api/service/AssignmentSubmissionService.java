package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;

    public List<AssignmentSubmission> getSubmissionsForAssignment(String assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId);
    }

    public List<AssignmentSubmission> getSubmissionsForStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId);
    }

    // Includes Duplicate Submission Prevention Logic (SSA-127)
    public AssignmentSubmission submitAssignment(AssignmentSubmission submission) {
        if (submissionRepository.findByAssignmentIdAndStudentId(submission.getAssignmentId(), submission.getStudentId()).isPresent()) {
            throw new RuntimeException("Student has already submitted this assignment.");
        }
        
        submission.setSubmittedAt(Instant.now());
        submission.setStatus("SUBMITTED");
        return submissionRepository.save(submission);
    }
}
