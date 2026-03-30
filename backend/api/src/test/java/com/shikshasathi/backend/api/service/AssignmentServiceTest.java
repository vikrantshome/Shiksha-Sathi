package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.AssignmentReportDTO;
import com.shikshasathi.backend.api.dto.StudentAssignmentDTO;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
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
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;
    
    @Mock
    private AssignmentSubmissionRepository submissionRepository;
    
    @Mock
    private ClassRepository classRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;
    
    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private AssignmentService assignmentService;

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
        mockedAssignment.setQuestionIds(new ArrayList<>());
    }

    @Test
    void getAssignmentReport_Authorized_ReturnsReport() {
        when(userRepository.findByEmail("teacher@owner.com")).thenReturn(Optional.of(teacherOwner));
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));

        AssignmentReportDTO result = assignmentService.getAssignmentReport("assign123", "teacher@owner.com");

        assertNotNull(result);
        assertEquals("assign123", result.getAssignment().getId());
    }

    @Test
    void getAssignmentReport_Unauthorized_ThrowsAccessDenied() {
        when(userRepository.findByEmail("hacker@fake.com")).thenReturn(Optional.of(anotherTeacher));
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));

        assertThrows(AccessDeniedException.class, () -> assignmentService.getAssignmentReport("assign123", "hacker@fake.com"));
    }

    @Test
    void publishAssignment_Unauthorized_ThrowsExceptionAndDoesNotSave() {
        when(userRepository.findByEmail("hacker@fake.com")).thenReturn(Optional.of(anotherTeacher));
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));

        assertThrows(AccessDeniedException.class, () -> assignmentService.publishAssignment("assign123", "hacker@fake.com"));
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void getAssignmentByLinkId_FallsBackToInMemoryPrefixMatch() {
        mockedAssignment.setId("69cac9883990dd64dc00dbb4");

        when(assignmentRepository.findFirstByIdStartingWith("69cac988")).thenReturn(Optional.empty());
        when(assignmentRepository.findAll()).thenReturn(List.of(mockedAssignment));

        StudentAssignmentDTO result = assignmentService.getAssignmentByLinkId("69cac988");

        assertNotNull(result);
        assertEquals("69cac9883990dd64dc00dbb4", result.getId());
    }
}
