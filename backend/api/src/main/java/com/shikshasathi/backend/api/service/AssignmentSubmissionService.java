package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.SubmissionDTO;

import com.shikshasathi.backend.api.events.NotificationEvent;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentSubmissionService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final AssignmentRepository assignmentRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public List<SubmissionDTO> getSubmissionsForAssignment(String assignmentId, String teacherEmail) {
        com.shikshasathi.backend.core.domain.user.User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new RuntimeException("Assignment not found"));
            
        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view submissions for this assignment");
        }
    
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<SubmissionDTO> getSubmissionsForStudent(String studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SubmissionDTO mapToDTO(AssignmentSubmission submission) {
        String studentName = userRepository.findById(submission.getStudentId())
                .map(u -> u.getName())
                .orElse("Unknown Student");

        return SubmissionDTO.builder()
                .id(submission.getId())
                .assignmentId(submission.getAssignmentId())
                .studentId(submission.getStudentId())
                .studentName(studentName)
                .answers(submission.getAnswers())
                .score(submission.getScore())
                .submittedAt(submission.getSubmittedAt())
                .status(submission.getStatus())
                .build();
    }

    // Includes Duplicate Submission Prevention Logic (SSA-127)
    public AssignmentSubmission submitAssignment(AssignmentSubmission submission) {
        if (submissionRepository.findByAssignmentIdAndStudentId(submission.getAssignmentId(), submission.getStudentId()).isPresent()) {
            throw new RuntimeException("Student has already submitted this assignment.");
        }
        
        submission.setSubmittedAt(Instant.now());
        submission.setStatus("SUBMITTED");
        AssignmentSubmission saved = submissionRepository.save(submission);
        eventPublisher.publishEvent(new NotificationEvent(this, submission.getStudentId(), "Assignment submitted successfully!"));
        return saved;
    }
}
