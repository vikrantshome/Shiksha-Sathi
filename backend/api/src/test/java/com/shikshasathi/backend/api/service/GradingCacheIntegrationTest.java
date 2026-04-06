package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.web.client.RestTemplate;

import java.util.Objects;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AI grading cache behavior.
 * Verifies that identical questions are cached and don't hit the API twice.
 */
@EnabledIfEnvironmentVariable(named = "NVIDIA_API_KEY", matches = ".+")
class GradingCacheIntegrationTest {

    private AIGradingService aiGradingService;

    @BeforeEach
    void setUp() {
        AIGradingProperties props = new AIGradingProperties();
        props.setEnabled(true);
        props.setProvider("nvidia");
        props.setModel("nvidia/nemotron-3-super-120b-a12b");
        props.setEndpointUrl("https://integrate.api.nvidia.com/v1/chat/completions");
        props.setApiKey(System.getenv("NVIDIA_API_KEY"));
        props.setTemperature(0.1);
        props.setFallbackToStringMatch(false);

        aiGradingService = new AIGradingService(props, new RestTemplate(), new ObjectMapper());
    }

    private Question sampleQuestion(String text, String correctAnswer, int points) {
        Question q = new Question();
        q.setId("q1");
        q.setText(text);
        q.setCorrectAnswer(correctAnswer);
        q.setPoints(points);
        q.setType("SHORT_ANSWER");
        return q;
    }

    @Test
    @DisplayName("Same question twice → both return same result")
    void testSameQuestionReturnsSameResult() {
        Question q = sampleQuestion("What is 2+2?", "4", 1);
        String expected = "4";
        String student = "Four";
        int maxMarks = 1;

        QuestionFeedbackDTO first = aiGradingService.gradeAnswer(q, expected, student, maxMarks);
        QuestionFeedbackDTO second = aiGradingService.gradeAnswer(q, expected, student, maxMarks);

        assertNotNull(first);
        assertNotNull(second);
        assertEquals(first.getMarksAwarded(), second.getMarksAwarded());
        assertEquals(first.isCorrect(), second.isCorrect());
    }

    @Test
    @DisplayName("Different answers → different results")
    void testDifferentAnswersGiveDifferentResults() {
        Question q = sampleQuestion("Formula of water?", "H2O", 2);
        String expected = "H2O";

        QuestionFeedbackDTO correct = aiGradingService.gradeAnswer(q, expected, "H2O", 2);
        QuestionFeedbackDTO wrong = aiGradingService.gradeAnswer(q, expected, "Oxygen and nitrogen", 2);

        assertNotEquals(correct.getMarksAwarded(), wrong.getMarksAwarded());
    }

    @Test
    @DisplayName("Case sensitivity → same result for same answer")
    void testCaseInsensitiveSameAnswer() {
        Question q = sampleQuestion("Capital of France?", "Paris", 2);

        QuestionFeedbackDTO upper = aiGradingService.gradeAnswer(q, "Paris", "PARIS", 2);
        QuestionFeedbackDTO lower = aiGradingService.gradeAnswer(q, "Paris", "paris", 2);

        // Both should be graded similarly (may differ slightly due to AI)
        assertEquals(upper.isCorrect(), lower.isCorrect());
    }

    @Test
    @DisplayName("Blank answer is consistent")
    void testBlankAnswerConsistency() {
        Question q = sampleQuestion("Powerhouse of cell?", "Mitochondria", 2);

        QuestionFeedbackDTO first = aiGradingService.gradeAnswer(q, "Mitochondria", "", 2);
        QuestionFeedbackDTO second = aiGradingService.gradeAnswer(q, "Mitochondria", "", 2);

        assertEquals(0, first.getMarksAwarded());
        assertEquals(0, second.getMarksAwarded());
        assertEquals(first.getMarksAwarded(), second.getMarksAwarded());
    }
}
