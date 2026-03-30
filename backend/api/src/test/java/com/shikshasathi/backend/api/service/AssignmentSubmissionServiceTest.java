package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentSubmissionServiceTest {

    @Mock
    private AssignmentSubmissionRepository submissionRepository;
    
    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AssignmentSubmissionService submissionService;

    private User teacherOwner;
    private User anotherTeacher;
    private Assignment mockedAssignment;

    @BeforeEach
    void setUp() {
        teacherOwner = new User();
        teacherOwner.setId("teacherOwnedId");
        teacherOwner.setEmail("teacher@owner.com");

        anotherTeacher = new User();
        anotherTeacher.setId("maliciousTeacher");
        anotherTeacher.setEmail("hacker@fake.com");

        mockedAssignment = new Assignment();
        mockedAssignment.setId("assign123");
        mockedAssignment.setTeacherId("teacherOwnedId");
    }

    @Test
    void getSubmissionsForAssignment_Authorized_ReturnsSubmissions() {
        when(userRepository.findByEmail("teacher@owner.com")).thenReturn(Optional.of(teacherOwner));
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));

        List<SubmissionDTO> result = submissionService.getSubmissionsForAssignment("assign123", "teacher@owner.com");

        assertNotNull(result);
    }

    @Test
    void getSubmissionsForAssignment_Unauthorized_ThrowsAccessDenied() {
        when(userRepository.findByEmail("hacker@fake.com")).thenReturn(Optional.of(anotherTeacher));
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));

        assertThrows(AccessDeniedException.class, () -> submissionService.getSubmissionsForAssignment("assign123", "hacker@fake.com"));
    }

    @Test
    void submitAssignment_DefaultsNullScoreToZero() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student1");
        submission.setScore(null);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student1")).thenReturn(Optional.empty());
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AssignmentSubmission saved = submissionService.submitAssignment(submission);

        assertEquals(0, saved.getScore());
        assertEquals("SUBMITTED", saved.getStatus());
    }
}
