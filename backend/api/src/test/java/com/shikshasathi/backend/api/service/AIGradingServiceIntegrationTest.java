package com.shikshasathi.backend.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shikshasathi.backend.api.config.AIGradingProperties;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration tests for AIGradingService that call the REAL NVIDIA API.
 *
 * These tests require the NVIDIA_API_KEY environment variable to be set.
 * Run with: NVIDIA_API_KEY=your-key ./gradlew test --tests AIGradingServiceIntegrationTest
 *
 * Tests are organized by difficulty:
 * - Basic: Simple fact recall
 * - Conceptual: Understanding of concepts
 * - Tough: Class 12 PCM questions requiring precise formulas/definitions
 */
@EnabledIfEnvironmentVariable(named = "NVIDIA_API_KEY", matches = ".+")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AIGradingServiceIntegrationTest {

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

    private QuestionFeedbackDTO grade(String question, String expected, String student, int maxMarks) {
        Question q = sampleQuestion(question, expected, maxMarks);
        return aiGradingService.gradeAnswer(q, expected, student, maxMarks);
    }

    // ======================== BASIC TESTS ========================

    @Test
    @Order(1)
    @DisplayName("Blank answer → 0 marks")
    void testBlankAnswer() {
        QuestionFeedbackDTO result = grade("What is photosynthesis?", "Process of converting sunlight to energy", "", 5);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
        assertTrue(result.isAiGradingFailed());
    }

    @Test
    @Order(2)
    @DisplayName("Whitespace only → 0 marks")
    void testWhitespaceAnswer() {
        QuestionFeedbackDTO result = grade("What is photosynthesis?", "Process of converting sunlight to energy", "   ", 5);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(3)
    @DisplayName("I don't know → 0 marks")
    void testIDontKnow() {
        QuestionFeedbackDTO result = grade("What is the capital of France?", "Paris", "I don't know", 2);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(4)
    @DisplayName("Exact match → full marks")
    void testExactMatch() {
        QuestionFeedbackDTO result = grade("Powerhouse of cell?", "Mitochondria", "Mitochondria", 2);
        assertEquals(2, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(5)
    @DisplayName("Wrong answer → 0 marks")
    void testWrongAnswer() {
        QuestionFeedbackDTO result = grade("Formula of water?", "H2O", "Oxygen and nitrogen", 3);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(6)
    @DisplayName("Spelling OK → full marks")
    void testSpellingOK() {
        QuestionFeedbackDTO result = grade("Largest planet?", "Jupiter", "Jupitar", 1);
        assertEquals(1, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    // ======================== CONCEPTUAL TESTS ========================

    @Test
    @Order(7)
    @DisplayName("Conceptual paraphrase → full marks")
    void testConceptualParaphrase() {
        QuestionFeedbackDTO result = grade(
                "What causes seasons?",
                "Tilt of axis causes varying sunlight",
                "Earth is tilted so different parts get more or less sun",
                5);
        assertEquals(5, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(8)
    @DisplayName("Partial understanding → partial marks")
    void testPartialUnderstanding() {
        QuestionFeedbackDTO result = grade(
                "Newton third law?",
                "Every action has equal and opposite reaction",
                "When you push something it pushes back",
                5);
        // Should get partial marks (1-4 out of 5)
        assertTrue(result.getMarksAwarded() >= 1 && result.getMarksAwarded() <= 4,
                "Expected partial marks, got " + result.getMarksAwarded());
    }

    @Test
    @Order(9)
    @DisplayName("Contradictory → 0 marks")
    void testContradictory() {
        QuestionFeedbackDTO result = grade(
                "Is Earth flat?",
                "No, Earth is spherical",
                "Yes, Earth is flat like a disc",
                2);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(10)
    @DisplayName("Off-topic → 0 marks")
    void testOffTopic() {
        QuestionFeedbackDTO result = grade(
                "Function of RBC?",
                "Carry oxygen from lungs to tissues",
                "RBC are red and found in veins",
                3);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    // ======================== TOUGH CLASS 12 PCM QUESTIONS ========================

    @Test
    @Order(11)
    @DisplayName("PHY: Faraday's law - conceptual description → partial marks")
    void testFaradaysLawConceptual() {
        QuestionFeedbackDTO result = grade(
                "State Faraday's law of electromagnetic induction.",
                "The induced EMF equals the negative rate of change of magnetic flux through the coil.",
                "EMF is induced when magnetic flux through a coil changes with time",
                3);
        // Student gives conceptual understanding without the formula
        assertTrue(result.getMarksAwarded() >= 1, "Should get at least partial credit for conceptual understanding");
    }

    @Test
    @Order(12)
    @DisplayName("PHY: Photoelectric effect - threshold concept → partial marks")
    void testPhotoelectricConceptual() {
        QuestionFeedbackDTO result = grade(
                "What is the photoelectric equation?",
                "E = hf - work_function, where hf is photon energy",
                "When light hits metal, electrons are ejected if frequency is above threshold",
                3);
        // Describes threshold but doesn't give the equation
        assertTrue(result.getMarksAwarded() <= 2, "Should not get full marks without the equation");
    }

    @Test
    @Order(13)
    @DisplayName("PHY: Binding energy - wrong definition → 0 marks")
    void testBindingEnergyWrong() {
        QuestionFeedbackDTO result = grade(
                "What is binding energy per nucleon?",
                "Total binding energy divided by number of nucleons",
                "It is the energy released when a nucleus splits",
                2);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(14)
    @DisplayName("CHEM: Nernst equation - verbal description → full marks")
    void testNernstVerbal() {
        QuestionFeedbackDTO result = grade(
                "Write the Nernst equation for electrode potential.",
                "E = E0 - (RT/nF) ln(Q)",
                "E equals E naught minus RT over nF times ln of Q",
                3);
        assertEquals(3, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(15)
    @DisplayName("CHEM: SN1 vs SN2 - conceptual distinction → full marks")
    void testSN1vsSN2Conceptual() {
        QuestionFeedbackDTO result = grade(
                "What distinguishes SN1 from SN2 mechanism?",
                "SN1 is unimolecular with carbocation intermediate; SN2 is bimolecular with concerted mechanism",
                "SN1 happens in two steps with intermediate, SN2 is single step",
                3);
        assertEquals(3, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(16)
    @DisplayName("CHEM: Rate law - wrong definition → 0 marks")
    void testRateLawWrong() {
        QuestionFeedbackDTO result = grade(
                "What is the order of a reaction?",
                "Sum of powers of concentration terms in rate equation",
                "It is the speed at which reactants convert to products",
                2);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(17)
    @DisplayName("MATH: Integration by parts - verbal formula → full marks")
    void testIntegrationByPartsVerbal() {
        QuestionFeedbackDTO result = grade(
                "State the formula for integration by parts.",
                "∫u dv = uv - ∫v du",
                "Integration of u times dv equals u times v minus integral of v times du",
                2);
        assertEquals(2, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(18)
    @DisplayName("MATH: Differential equation order - conceptual → full marks")
    void testDiffEqOrderConceptual() {
        QuestionFeedbackDTO result = grade(
                "What is the order of a differential equation?",
                "Highest order derivative present in the equation",
                "It tells you the highest derivative number in the equation",
                2);
        assertEquals(2, result.getMarksAwarded());
        assertTrue(result.isCorrect());
    }

    @Test
    @Order(19)
    @DisplayName("MATH: Bayes theorem - wrong definition → 0 marks")
    void testBayesWrong() {
        QuestionFeedbackDTO result = grade(
                "State Bayes' theorem.",
                "P(A|B) = P(B|A)*P(A) / P(B)",
                "It is used to find the probability of two events occurring together",
                2);
        assertEquals(0, result.getMarksAwarded());
        assertFalse(result.isCorrect());
    }

    @Test
    @Order(20)
    @DisplayName("MATH: Matrix inverse - necessary but not sufficient → partial marks")
    void testMatrixInversePartial() {
        QuestionFeedbackDTO result = grade(
                "What is the condition for a matrix to be invertible?",
                "Determinant must be non-zero",
                "The matrix must be square",
                2);
        // Square is necessary but not sufficient
        assertTrue(result.getMarksAwarded() <= 1, "Should not get full marks for incomplete answer");
    }
}
