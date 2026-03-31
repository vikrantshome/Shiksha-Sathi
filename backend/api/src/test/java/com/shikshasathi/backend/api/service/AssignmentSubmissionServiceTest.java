package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.SubmitAssignmentResponseDTO;
import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.api.exception.DuplicateSubmissionException;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
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
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AssignmentSubmissionServiceTest {

    @Mock
    private AssignmentSubmissionRepository submissionRepository;
    
    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private QuestionRepository questionRepository;

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
        mockedAssignment.setMaxScore(3);
        mockedAssignment.setQuestionIds(List.of("q1", "q2"));
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
    void submitAssignment_StoresIdentityAndGradesAnswers() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student1");
        submission.setStudentName("Anuraag Patil");
        submission.setAnswers(Map.of("q1", "Equal", "q2", "AAA"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("Two triangles are similar if their corresponding angles are:");
        question1.setCorrectAnswer("Equal");
        question1.setPoints(1);

        Question question2 = new Question();
        question2.setId("q2");
        question2.setText("What is the AAA similarity criterion?");
        question2.setCorrectAnswer("AAA");
        question2.setPoints(2);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student1")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(questionRepository.findById("q2")).thenReturn(Optional.of(question2));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(3, result.getScore());
        assertEquals(3, result.getTotalMarks());
        assertEquals(2, result.getFeedback().size());

        verify(submissionRepository).save(argThat(saved ->
                "Anuraag Patil".equals(saved.getStudentName()) &&
                "student1".equals(saved.getStudentRollNumber()) &&
                Integer.valueOf(3).equals(saved.getScore()) &&
                "GRADED".equals(saved.getStatus())
        ));
    }

    @Test
    void submitAssignment_RejectsDuplicateSubmissionWithSpecificException() {
        AssignmentSubmission existing = new AssignmentSubmission();
        existing.setAssignmentId("assign123");
        existing.setStudentId("student1");

        AssignmentSubmission incoming = new AssignmentSubmission();
        incoming.setAssignmentId("assign123");
        incoming.setStudentId("student1");

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student1"))
                .thenReturn(Optional.of(existing));

        assertThrows(DuplicateSubmissionException.class, () -> submissionService.submitAssignment(incoming));
        verify(submissionRepository, never()).save(any());
    }

    @Test
    void submitAssignment_NormalizesUnicodeAnswersForMatching() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student2");
        submission.setStudentName("Unicode Tester");
        submission.setAnswers(Map.of("q1", "a1/a2 = b1/b2 = c1/c2", "q2", "AAA"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("What is the condition for coincident lines?");
        question1.setCorrectAnswer("a₁/a₂ = b₁/b₂ = c₁/c₂");
        question1.setPoints(2);

        Question question2 = new Question();
        question2.setId("q2");
        question2.setText("What is the AAA similarity criterion?");
        question2.setCorrectAnswer("AAA");
        question2.setPoints(2);

        mockedAssignment.setQuestionIds(List.of("q1", "q2"));
        mockedAssignment.setMaxScore(4);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student2")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(questionRepository.findById("q2")).thenReturn(Optional.of(question2));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(4, result.getScore());
        assertTrue(result.getFeedback().get(0).isCorrect());
        assertTrue(result.getFeedback().get(1).isCorrect());
    }
}
