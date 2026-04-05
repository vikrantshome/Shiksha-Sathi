package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@MockitoSettings(strictness = Strictness.LENIENT)
@ExtendWith(MockitoExtension.class)
public class AIGradingServiceTest {

    @Mock
    private AIGradingProperties aiGradingProperties;

    @Mock
    private RestTemplate restTemplate;

    private AIGradingService aiGradingService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        aiGradingService = new AIGradingService(aiGradingProperties, restTemplate, objectMapper);
    }

    private Question sampleQuestion() {
        Question q = new Question();
        q.setId("q1");
        q.setText("What is photosynthesis?");
        q.setType("SHORT_ANSWER");
        q.setPoints(5);
        q.setCorrectAnswer("The process by which plants convert sunlight into energy");
        return q;
    }

    @Test
    void gradeAnswer_AIEnabled_ReturnsAIGradedResult() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        String aiResponse = """
            {"marks_awarded": 4.0, "max_marks": 5, "is_correct": true, "reasoning": "Correct concept", "confidence": 0.9}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(aiResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "The process by which plants convert sunlight into energy",
                "Plants use sunlight to make food", 5);

        assertTrue(result.isCorrect());
        assertEquals(4, result.getMarksAwarded());
        assertEquals("Correct concept", result.getReasoning());
        assertEquals(0.9, result.getConfidence());
    }

    @Test
    void gradeAnswer_AIDisabled_FallsBackToStringMatch() {
        when(aiGradingProperties.isEnabled()).thenReturn(false);

        Question question = sampleQuestion();

        // Exact match → correct
        QuestionFeedbackDTO exact = aiGradingService.gradeAnswer(
                question, "Equal", "Equal", 5);
        assertTrue(exact.isCorrect());
        assertEquals(5, exact.getMarksAwarded());
        assertNull(exact.getReasoning());
        assertNull(exact.getConfidence());

        // Non-match → incorrect
        QuestionFeedbackDTO wrong = aiGradingService.gradeAnswer(
                question, "Equal", "Wrong answer", 5);
        assertFalse(wrong.isCorrect());
        assertEquals(0, wrong.getMarksAwarded());
    }

    @Test
    void gradeAnswer_AITimeout_FallsBackToStringMatch() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Timeout"));

        Question question = sampleQuestion();

        // String match fallback: correct answer matches
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "The process by which plants convert sunlight into energy",
                "The process by which plants convert sunlight into energy", 5);

        assertTrue(result.isCorrect());
        assertEquals(5, result.getMarksAwarded());
    }

    @Test
    void gradeAnswer_AIError_FallsBackToStringMatch() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Equal", "Equal", 5);

        // Falls back to string match which should find the exact match
        assertTrue(result.isCorrect());
    }

    @Test
    void gradeAnswer_AIMalformedJson_FallsBackToStringMatch() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("not valid json at all", HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Equal", "Equal", 5);

        // Falls back to string match
        assertTrue(result.isCorrect());
    }

    @Test
    void gradeAnswer_AIGradingDisabled_FallbackDisabled_ReturnsError() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Some answer", "Wrong", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertEquals("Grading service error", result.getReasoning());
    }

    @Test
    void gradeAnswer_BlankStudentAnswer_AIGrading() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        String aiResponse = """
            {"marks_awarded": 0.0, "max_marks": 5, "is_correct": false, "reasoning": "Blank answer", "confidence": 1.0}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(aiResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Photosynthesis", "", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
    }

    @Test
    void stringMatchFallback_ParentheticalAnswers() {
        when(aiGradingProperties.isEnabled()).thenReturn(false);

        Question question = new Question();
        question.setId("q2");
        question.setText("Male reproductive organ");
        question.setType("SHORT_ANSWER");
        question.setPoints(1);
        question.setCorrectAnswer("testes (or testicles)");

        // Both variants should match
        QuestionFeedbackDTO result1 = aiGradingService.gradeAnswer(
                question, "testes (or testicles)", "testes", 1);
        assertTrue(result1.isCorrect());

        QuestionFeedbackDTO result2 = aiGradingService.gradeAnswer(
                question, "testes (or testicles)", "testicles", 1);
        assertTrue(result2.isCorrect());
    }
}
