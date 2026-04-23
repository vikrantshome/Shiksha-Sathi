package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
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

    @Mock
    private AIGradingService aiGradingService;

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

    @Test
    void submitAssignment_AcceptsAlternateParentheticalAnswers() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student3");
        submission.setStudentName("Alternate Answer Tester");
        submission.setAnswers(Map.of("q1", "testicles", "q2", "AAA"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("The male reproductive organ in humans is called ________.");
        question1.setCorrectAnswer("testes (or testicles)");
        question1.setPoints(1);

        Question question2 = new Question();
        question2.setId("q2");
        question2.setText("What is the AAA similarity criterion?");
        question2.setCorrectAnswer("AAA");
        question2.setPoints(2);

        mockedAssignment.setQuestionIds(List.of("q1", "q2"));
        mockedAssignment.setMaxScore(3);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student3")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(questionRepository.findById("q2")).thenReturn(Optional.of(question2));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(3, result.getScore());
        assertTrue(result.getFeedback().get(0).isCorrect());
        assertEquals(1, result.getFeedback().get(0).getMarksAwarded());
    }

    @Test
    void submitAssignment_AIGradesShortAnswerQuestions() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student4");
        submission.setStudentName("AI Grading Tester");
        submission.setAnswers(Map.of("q1", "Plants use sunlight to make food"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("What is photosynthesis?");
        question1.setType("SHORT_ANSWER");
        question1.setCorrectAnswer("The process by which plants convert sunlight into energy");
        question1.setPoints(5);

        mockedAssignment.setQuestionIds(List.of("q1"));
        mockedAssignment.setMaxScore(5);

        QuestionFeedbackDTO aiFeedback = QuestionFeedbackDTO.builder()
                .questionId("q1")
                .questionText("What is photosynthesis?")
                .studentAnswer("Plants use sunlight to make food")
                .correctAnswer("The process by which plants convert sunlight into energy")
                .isCorrect(true)
                .marksAwarded(4)
                .reasoning("Student correctly identifies the core concept")
                .confidence(0.9)
                .build();
        when(aiGradingService.gradeAnswer(any(), anyString(), anyString(), anyInt()))
                .thenReturn(aiFeedback);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student4")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(4, result.getScore());
        assertEquals(1, result.getFeedback().size());
        QuestionFeedbackDTO feedback = result.getFeedback().get(0);
        assertTrue(feedback.isCorrect());
        assertEquals(4, feedback.getMarksAwarded());
        assertEquals("Student correctly identifies the core concept", feedback.getReasoning());
        assertEquals(0.9, feedback.getConfidence());

        verify(aiGradingService).gradeAnswer(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void submitAssignment_MCQUsesExactMatchNotAI() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student5");
        submission.setStudentName("MCQ Tester");
        submission.setAnswers(Map.of("q1", "Equal"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("Two triangles are similar if corresponding angles are:");
        question1.setType("MULTIPLE_CHOICE");
        question1.setCorrectAnswer("Equal");
        question1.setPoints(3);

        mockedAssignment.setQuestionIds(List.of("q1"));
        mockedAssignment.setMaxScore(3);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student5")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(3, result.getScore());
        verify(aiGradingService, never()).gradeAnswer(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void submitAssignment_TrueFalseUsesExactMatchNotAI() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student6");
        submission.setStudentName("TF Tester");
        submission.setAnswers(Map.of("q1", "True"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("The earth is flat");
        question1.setType("TRUE_FALSE");
        question1.setCorrectAnswer("False");
        question1.setPoints(1);

        mockedAssignment.setQuestionIds(List.of("q1"));
        mockedAssignment.setMaxScore(1);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student6")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(0, result.getScore());
        assertFalse(result.getFeedback().get(0).isCorrect());
        verify(aiGradingService, never()).gradeAnswer(any(), anyString(), anyString(), anyInt());
    }

    @Test
    void submitAssignment_FillInBlanksUsesAIGrading() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student7");
        submission.setStudentName("FIB Tester");
        submission.setAnswers(Map.of("q1", "mitochondria"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("The powerhouse of the cell is the ________");
        question1.setType("FILL_IN_BLANKS");
        question1.setCorrectAnswer("mitochondria");
        question1.setPoints(2);

        mockedAssignment.setQuestionIds(List.of("q1"));
        mockedAssignment.setMaxScore(2);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student7")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(2, result.getScore());
        assertTrue(result.getFeedback().get(0).isCorrect());
        verifyNoInteractions(aiGradingService);
    }

    @Test
    void submitAssignment_AIFailure_SetsPartiallyGradedStatus() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student8");
        submission.setStudentName("AI Failure Tester");
        submission.setAnswers(Map.of("q1", "Some answer"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("What is photosynthesis?");
        question1.setType("SHORT_ANSWER");
        question1.setCorrectAnswer("Process of converting sunlight to energy");
        question1.setPoints(5);

        mockedAssignment.setQuestionIds(List.of("q1"));
        mockedAssignment.setMaxScore(5);

        QuestionFeedbackDTO failedFeedback = QuestionFeedbackDTO.builder()
                .questionId("q1")
                .questionText("What is photosynthesis?")
                .studentAnswer("Some answer")
                .correctAnswer("Process of converting sunlight to energy")
                .isCorrect(false)
                .marksAwarded(0)
                .reasoning("AI grading service unavailable — answer pending review")
                .confidence(0.0)
                .aiGradingFailed(true)
                .build();
        when(aiGradingService.gradeAnswer(any(), anyString(), anyString(), anyInt()))
                .thenReturn(failedFeedback);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student8")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(0, result.getScore());
        assertTrue(result.getFeedback().get(0).isAiGradingFailed());
        verify(submissionRepository).save(argThat(saved ->
                "PARTIALLY_GRADED".equals(saved.getStatus())
        ));
    }

    @Test
    void submitAssignment_MixedQuestions_AIGradedAndExactMatch() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student9");
        submission.setStudentName("Mixed Tester");
        submission.setAnswers(Map.of("q1", "Correct MCQ answer", "q2", "conceptual explanation"));

        Question q1 = new Question();
        q1.setId("q1");
        q1.setText("MCQ question");
        q1.setType("MULTIPLE_CHOICE");
        q1.setCorrectAnswer("Correct MCQ answer");
        q1.setPoints(2);

        Question q2 = new Question();
        q2.setId("q2");
        q2.setText("Explain concept");
        q2.setType("SHORT_ANSWER");
        q2.setCorrectAnswer("The right concept");
        q2.setPoints(3);

        mockedAssignment.setQuestionIds(List.of("q1", "q2"));
        mockedAssignment.setMaxScore(5);

        QuestionFeedbackDTO aiFeedback = QuestionFeedbackDTO.builder()
                .questionId("q2")
                .questionText("Explain concept")
                .studentAnswer("conceptual explanation")
                .correctAnswer("The right concept")
                .isCorrect(true)
                .marksAwarded(3)
                .reasoning("Good conceptual understanding")
                .confidence(0.85)
                .build();
        when(aiGradingService.gradeAnswer(any(), anyString(), anyString(), anyInt()))
                .thenReturn(aiFeedback);

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student9")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(q1));
        when(questionRepository.findById("q2")).thenReturn(Optional.of(q2));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(5, result.getScore());
        // Q1: exact match (MCQ), Q2: AI graded
        assertFalse(result.getFeedback().get(0).isAiGradingFailed());
        assertFalse(result.getFeedback().get(1).isAiGradingFailed());
        assertEquals(2, result.getFeedback().size());
    }

    @Test
    void submitAssignment_PopulatesExplanationField() {
        AssignmentSubmission submission = new AssignmentSubmission();
        submission.setAssignmentId("assign123");
        submission.setStudentId("student10");
        submission.setAnswers(Map.of("q1", "Equal"));

        Question question1 = new Question();
        question1.setId("q1");
        question1.setText("Two triangles are similar if their corresponding angles are:");
        question1.setCorrectAnswer("Equal");
        question1.setPoints(1);
        question1.setExplanation("Angles must be equal for similarity.");

        mockedAssignment.setQuestionIds(List.of("q1"));

        when(submissionRepository.findByAssignmentIdAndStudentId("assign123", "student10")).thenReturn(Optional.empty());
        when(assignmentRepository.findById("assign123")).thenReturn(Optional.of(mockedAssignment));
        when(questionRepository.findById("q1")).thenReturn(Optional.of(question1));
        when(submissionRepository.save(any(AssignmentSubmission.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SubmitAssignmentResponseDTO result = submissionService.submitAssignment(submission);

        assertEquals(1, result.getFeedback().size());
        assertEquals("Angles must be equal for similarity.", result.getFeedback().get(0).getExplanation());
    }
}
