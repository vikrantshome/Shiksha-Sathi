package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

/**
 * Tests for AIGradingService.
 */
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
        when(aiGradingProperties.getProvider()).thenReturn("hf-space");
        when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
        when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        String aiResponse = """
            {"marks_awarded": 4.0, "max_marks": 5, "is_correct": true, "reasoning": "The answer correctly explains the process of photosynthesis with accurate details", "confidence": 0.9}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(aiResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "The process by which plants convert sunlight into energy",
                "Plants use sunlight to make food", 5);

        assertTrue(result.isCorrect());
        assertEquals(4, result.getMarksAwarded());
        assertEquals("The answer correctly explains the process of photosynthesis with accurate details", result.getReasoning());
        assertEquals(0.9, result.getConfidence());
        assertFalse(result.isAiGradingFailed());
    }

    @Test
    void gradeAnswer_AIDisabled_MarksAsPendingReview() {
        when(aiGradingProperties.isEnabled()).thenReturn(false);

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "The process by which plants convert sunlight into energy",
                "Plants use sunlight", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertTrue(result.isAiGradingFailed());
        assertTrue(result.getReasoning().contains("disabled"));
    }

    @Test
    void gradeAnswer_AITimeout_MarksAsPendingReview_NoStringFallback() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getProvider()).thenReturn("hf-space");
        when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Timeout"));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Photosynthesis", "Plants make food", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertTrue(result.isAiGradingFailed());
        assertTrue(result.getReasoning().contains("unavailable"));
    }

    @Test
    void gradeAnswer_AIHttp500_MarksAsPendingReview() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getProvider()).thenReturn("hf-space");
        when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("Internal error", HttpStatus.INTERNAL_SERVER_ERROR));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Photosynthesis", "Wrong answer", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertTrue(result.isAiGradingFailed());
    }

    @Test
    void gradeAnswer_AIMalformedJson_MarksAsPendingReview() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getProvider()).thenReturn("hf-space");
        when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>("not valid json at all", HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Equal", "Equal", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertTrue(result.isAiGradingFailed());
    }

    @Test
    void gradeAnswer_AIFailure_ExplicitFallbackEnabled_UsesStringMatch() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getProvider()).thenReturn("hf-space");
        when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(true);

        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenThrow(new ResourceAccessException("Connection refused"));

        Question question = sampleQuestion();

        QuestionFeedbackDTO exact = aiGradingService.gradeAnswer(
                question, "Equal", "Equal", 5);
        assertTrue(exact.isCorrect());
        assertEquals(5, exact.getMarksAwarded());
        assertFalse(exact.isAiGradingFailed());

        QuestionFeedbackDTO wrong = aiGradingService.gradeAnswer(
                question, "Equal", "Wrong", 5);
        assertFalse(wrong.isCorrect());
        assertEquals(0, wrong.getMarksAwarded());
    }

    @Test
     void gradeAnswer_BlankStudentAnswer_AIGrading() {
         when(aiGradingProperties.isEnabled()).thenReturn(true);
         when(aiGradingProperties.getProvider()).thenReturn("hf-space");
         when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
         when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
         when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        String aiResponse = """
            {"marks_awarded": 0.0, "max_marks": 5, "is_correct": false, "reasoning": "Student answer is blank; no response provided", "confidence": 1.0}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(aiResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Photosynthesis", "", 5);

        assertFalse(result.isCorrect());
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isAiGradingFailed());
    }

    @Test
     void gradeAnswer_AIPartialCredit() {
         when(aiGradingProperties.isEnabled()).thenReturn(true);
         when(aiGradingProperties.getProvider()).thenReturn("hf-space");
         when(aiGradingProperties.getEndpointUrl()).thenReturn("http://test-endpoint");
         when(aiGradingProperties.getHfSpaceUrl()).thenReturn("http://test-endpoint/grade");
         when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        String aiResponse = """
            {"marks_awarded": 2.5, "max_marks": 5, "is_correct": true, "reasoning": "Partial understanding shown", "confidence": 0.7}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(aiResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "Photosynthesis uses sunlight", "sunlight helps plants", 5);

        assertEquals(3, result.getMarksAwarded());
        assertTrue(result.isCorrect());
        assertEquals("Partial understanding shown", result.getReasoning());
        assertEquals(0.7, result.getConfidence());
        assertFalse(result.isAiGradingFailed());
    }

    @Test
    void gradeAnswer_NvidiaApi_ReturnsAIGradedResult() {
        when(aiGradingProperties.isEnabled()).thenReturn(true);
        when(aiGradingProperties.getProvider()).thenReturn("nvidia");
        when(aiGradingProperties.getEndpointUrl()).thenReturn("https://integrate.api.nvidia.com/v1/chat/completions");
        when(aiGradingProperties.getModel()).thenReturn("moonshotai/kimi-k2-thinking");
        when(aiGradingProperties.getTemperature()).thenReturn(0.1);
        when(aiGradingProperties.isFallbackToStringMatch()).thenReturn(false);

        // NVIDIA API response format
        String nvidiaResponse = """
            {"choices":[{"index":0,"message":{"role":"assistant","content":"{\\"marks_awarded\\": 4.0, \\"max_marks\\": 5, \\"is_correct\\": true, \\"reasoning\\": \\"The answer correctly explains the process of photosynthesis with accurate details\\", \\"confidence\\": 0.9}"}}],"usage":{"total_tokens":50}}
            """;
        when(restTemplate.postForEntity(anyString(), any(), eq(String.class)))
                .thenReturn(new ResponseEntity<>(nvidiaResponse, HttpStatus.OK));

        Question question = sampleQuestion();
        QuestionFeedbackDTO result = aiGradingService.gradeAnswer(
                question, "The process by which plants convert sunlight into energy",
                "Plants use sunlight to make food", 5);

        assertTrue(result.isCorrect());
        assertEquals(4, result.getMarksAwarded());
        assertEquals("The answer correctly explains the process of photosynthesis with accurate details", result.getReasoning());
        assertEquals(0.9, result.getConfidence());
        assertFalse(result.isAiGradingFailed());
    }
}
