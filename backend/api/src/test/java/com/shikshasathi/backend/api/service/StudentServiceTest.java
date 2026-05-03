package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizAttemptRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)

@ExtendWith(MockitoExtension.class)
public class StudentServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private AssignmentSubmissionRepository assignmentSubmissionRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StudentService studentService;

    private User student;
    private ClassEntity classEntity;
    private Assignment publishedAssignment;

    @BeforeEach
    void setUp() {
        student = new User();
        student.setId("student-id-123");
        student.setPhone("9876543220");
        student.setEmail("student@example.com");
        student.setRollNumber("ROLL001");

        classEntity = new ClassEntity();
        classEntity.setId("class-id-456");
        classEntity.setName("Class 8");
        classEntity.setSection("A");
        classEntity.setActive(true);
        classEntity.setStudentIds(List.of("student-id-123"));

        publishedAssignment = new Assignment();
        publishedAssignment.setId("assignment-id-789");
        publishedAssignment.setTitle("Math Assignment");
        publishedAssignment.setClassId("class-id-456");
        publishedAssignment.setStatus("PUBLISHED");
        publishedAssignment.setTeacherId("teacher-id-001");
    }

    @Test
    void getEnrolledClasses_StudentEnrolled_ReturnsClass() {
        when(userRepository.findByPhone("9876543220")).thenReturn(List.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));

        List<ClassEntity> result = studentService.getEnrolledClasses("9876543220");

        assertEquals(1, result.size());
        assertEquals("class-id-456", result.get(0).getId());
    }

    @Test
    void getEnrolledClasses_StudentEnrolledByMongoDBId_ReturnsClass() {
        when(userRepository.findById("student-id-123")).thenReturn(Optional.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));

        List<ClassEntity> result = studentService.getEnrolledClasses("student-id-123");

        assertEquals(1, result.size());
        assertEquals("class-id-456", result.get(0).getId());
    }

    @Test
    void getEnrolledClasses_StudentNotEnrolled_ReturnsEmptyList() {
        when(userRepository.findByPhone("9999999999")).thenReturn(List.of());
        when(classRepository.findByStudentIdsContaining("9999999999")).thenReturn(List.of());

        List<ClassEntity> result = studentService.getEnrolledClasses("9999999999");

        assertTrue(result.isEmpty());
    }

    @Test
    void getPendingAssignments_StudentEnrolledInClassWithPublishedAssignment_ReturnsAssignment() {
        when(userRepository.findByPhone("9876543220")).thenReturn(List.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));
        when(classRepository.findByStudentIdsContaining("ROLL001")).thenReturn(List.of());
        when(assignmentRepository.findByClassIdIn(List.of("class-id-456"))).thenReturn(List.of(publishedAssignment));
        when(assignmentSubmissionRepository.findByStudentId("9876543220")).thenReturn(List.of());
        when(assignmentSubmissionRepository.findByStudentRollNumber("9876543220")).thenReturn(List.of());

        List<Assignment> result = studentService.getPendingAssignments("9876543220");

        assertEquals(1, result.size());
        assertEquals("assignment-id-789", result.get(0).getId());
    }

    @Test
    void getPendingAssignments_StudentAlreadySubmittedAssignment_FiltersOutSubmitted() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assignment-id-789");
        submission.setStudentId("student-id-123");

        when(userRepository.findByPhone("9876543220")).thenReturn(List.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));
        when(assignmentRepository.findByClassIdIn(List.of("class-id-456"))).thenReturn(List.of(publishedAssignment));
        when(assignmentSubmissionRepository.findByStudentId("student-id-123")).thenReturn(List.of(submission));
        when(assignmentSubmissionRepository.findByStudentRollNumber("student-id-123")).thenReturn(List.of());
        when(assignmentSubmissionRepository.findByStudentId("ROLL001")).thenReturn(List.of());
        when(assignmentSubmissionRepository.findByStudentRollNumber("ROLL001")).thenReturn(List.of());

        List<Assignment> result = studentService.getPendingAssignments("9876543220");

        assertTrue(result.isEmpty());
    }

    @Test
    void getPendingAssignments_StudentNotEnrolledInAnyClass_ReturnsEmptyList() {
        when(userRepository.findByPhone("9999999999")).thenReturn(List.of());
        when(classRepository.findByStudentIdsContaining("9999999999")).thenReturn(List.of());

        List<Assignment> result = studentService.getPendingAssignments("9999999999");

        assertTrue(result.isEmpty());
    }

    @Test
    void getPendingAssignments_FiltersOutDraftAssignments() {
        Assignment draftAssignment = new Assignment();
        draftAssignment.setId("draft-assignment-id");
        draftAssignment.setClassId("class-id-456");
        draftAssignment.setStatus("DRAFT");

        when(userRepository.findByPhone("9876543220")).thenReturn(List.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));
        when(assignmentRepository.findByClassIdIn(List.of("class-id-456"))).thenReturn(List.of(publishedAssignment, draftAssignment));
        when(assignmentSubmissionRepository.findByStudentId("9876543220")).thenReturn(List.of());
        when(assignmentSubmissionRepository.findByStudentRollNumber("9876543220")).thenReturn(List.of());

        List<Assignment> result = studentService.getPendingAssignments("9876543220");

        assertEquals(1, result.size());
        assertEquals("PUBLISHED", result.get(0).getStatus());
    }

    @Test
    void getPendingAssignments_StudentEnrolledByRollNumber_ReturnsAssignment() {
        when(userRepository.findById("ROLL001")).thenReturn(Optional.empty());
        when(userRepository.findByEmail("ROLL001")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("ROLL001")).thenReturn(List.of(student));
        when(classRepository.findByStudentIdsContaining("student-id-123")).thenReturn(List.of(classEntity));
        when(assignmentRepository.findByClassIdIn(List.of("class-id-456"))).thenReturn(List.of(publishedAssignment));
        when(assignmentSubmissionRepository.findByStudentId("ROLL001")).thenReturn(List.of());
        when(assignmentSubmissionRepository.findByStudentRollNumber("ROLL001")).thenReturn(List.of());

        List<Assignment> result = studentService.getPendingAssignments("ROLL001");

        assertEquals(1, result.size());
    }
}