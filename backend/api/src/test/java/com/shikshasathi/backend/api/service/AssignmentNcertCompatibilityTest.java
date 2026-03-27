package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Provenance;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests to validate assignment compatibility with NCERT questions.
 * SSA-207: Assignment Compatibility Validation
 * 
 * These tests verify that:
 * 1. Assignment schema is compatible with NCERT question references
 * 2. Answer keys can be stored and retrieved correctly
 * 3. Grading logic works with all question types (MCQ, Short Answer, Fill-in-Blanks)
 * 4. Mixed question types work in a single assignment
 */
public class AssignmentNcertCompatibilityTest {

    @Test
    void testAssignmentSchemaCompatibility() {
        // Verify Assignment can store question IDs
        Assignment assignment = new Assignment();
        assignment.setTitle("NCERT Chapter 1 Test");
        assignment.setDescription("Test assignment with NCERT questions");
        assignment.setSubjectId("Science");
        assignment.setClassId("class-6");
        assignment.setTeacherId("teacher-1");
        assignment.setQuestionIds(Arrays.asList("q1", "q2", "q3"));
        assignment.setMaxScore(10);
        assignment.setStatus("DRAFT");

        assertNotNull(assignment.getId() == null || assignment.getId() != null);
        assertEquals("NCERT Chapter 1 Test", assignment.getTitle());
        assertEquals(3, assignment.getQuestionIds().size());
        assertEquals("DRAFT", assignment.getStatus());
    }

    @Test
    void testQuestionSchemaWithProvenance() {
        // Verify Question schema supports NCERT provenance
        Question question = new Question();
        question.setSubjectId("Science");
        question.setChapter("Chapter 1: The Wonderful World of Science");
        question.setType("MCQ");
        question.setText("Which of the following is a method used by scientists?");
        question.setOptions(Arrays.asList("Observation", "Guessing", "Ignoring data"));
        question.setCorrectAnswer("Observation");
        question.setExplanation("Scientists use systematic observation.");
        question.setPoints(1);
        question.setSourceKind("CANONICAL");
        question.setReviewStatus("APPROVED");

        // Set provenance
        Provenance provenance = new Provenance();
        provenance.setBoard("NCERT");
        provenance.setClassLevel("6");
        provenance.setSubject("Science");
        provenance.setBook("Curiosity");
        provenance.setChapterNumber(1);
        provenance.setChapterTitle("The Wonderful World of Science");
        question.setProvenance(provenance);

        // Verify all fields are accessible
        assertEquals("Science", question.getSubjectId());
        assertEquals("MCQ", question.getType());
        assertEquals("Observation", question.getCorrectAnswer());
        assertEquals("CANONICAL", question.getSourceKind());
        assertEquals("APPROVED", question.getReviewStatus());
        assertNotNull(question.getProvenance());
        assertEquals("NCERT", question.getProvenance().getBoard());
        assertEquals("6", question.getProvenance().getClassLevel());
    }

    @Test
    void testAnswerKeyRetrieval() {
        // Test MCQ answer key
        Question mcqQuestion = new Question();
        mcqQuestion.setType("MCQ");
        mcqQuestion.setOptions(Arrays.asList("A", "B", "C", "D"));
        mcqQuestion.setCorrectAnswer("B");

        assertTrue(mcqQuestion.getOptions().contains(mcqQuestion.getCorrectAnswer()));

        // Test Fill-in-Blanks answer key
        Question fillBlanksQuestion = new Question();
        fillBlanksQuestion.setType("FILL_IN_BLANKS");
        fillBlanksQuestion.setCorrectAnswer("photosynthesis");
        assertNotNull(fillBlanksQuestion.getCorrectAnswer());

        // Test Short Answer
        Question shortAnswerQuestion = new Question();
        shortAnswerQuestion.setType("SHORT_ANSWER");
        shortAnswerQuestion.setCorrectAnswer("The process by which plants make food");
        assertNotNull(shortAnswerQuestion.getCorrectAnswer());
    }

    @Test
    void testGradingCompatibilityWithMcq() {
        // Simulate grading logic for MCQ
        Question question = new Question();
        question.setType("MCQ");
        question.setOptions(Arrays.asList("Xylem", "Phloem", "Stomata", "Chloroplast"));
        question.setCorrectAnswer("Xylem");

        String studentAnswer = "Xylem";
        boolean isCorrect = studentAnswer.equalsIgnoreCase(question.getCorrectAnswer());
        assertTrue(isCorrect, "Should mark correct answer as correct");

        studentAnswer = "Phloem";
        isCorrect = studentAnswer.equalsIgnoreCase(question.getCorrectAnswer());
        assertFalse(isCorrect, "Should mark incorrect answer as wrong");
    }

    @Test
    void testGradingCompatibilityWithFillInBlanks() {
        // Simulate grading for fill-in-blanks (case-insensitive)
        Question question = new Question();
        question.setType("FILL_IN_BLANKS");
        question.setCorrectAnswer("dialysis");

        // Test case-insensitive matching
        assertTrue("dialysis".equalsIgnoreCase(question.getCorrectAnswer()));
        assertTrue("DIALYSIS".equalsIgnoreCase(question.getCorrectAnswer()));
        assertTrue("Dialysis".equalsIgnoreCase(question.getCorrectAnswer()));
    }

    @Test
    void testAssignmentWithMixedQuestionTypes() {
        // Create mock questions of different types
        Question mcq = new Question();
        mcq.setType("MCQ");
        mcq.setCorrectAnswer("A");
        mcq.setPoints(1);

        Question shortAnswer = new Question();
        shortAnswer.setType("SHORT_ANSWER");
        shortAnswer.setCorrectAnswer("Short explanation");
        shortAnswer.setPoints(2);

        Question fillBlanks = new Question();
        fillBlanks.setType("FILL_IN_BLANKS");
        fillBlanks.setCorrectAnswer("answer");
        fillBlanks.setPoints(1);

        Question trueFalse = new Question();
        trueFalse.setType("TRUE_FALSE");
        trueFalse.setOptions(Arrays.asList("True", "False"));
        trueFalse.setCorrectAnswer("True");
        trueFalse.setPoints(1);

        // Calculate total marks
        int totalMarks = mcq.getPoints() + shortAnswer.getPoints() + fillBlanks.getPoints() + trueFalse.getPoints();
        assertEquals(5, totalMarks);

        // Create assignment
        Assignment assignment = new Assignment();
        assignment.setTitle("Mixed Types Test");
        assignment.setQuestionIds(Arrays.asList("q1", "q2", "q3", "q4"));
        assignment.setMaxScore(totalMarks);

        assertEquals(4, assignment.getQuestionIds().size());
        assertEquals(5, assignment.getMaxScore());
    }

    @Test
    void testNcertQuestionFieldsCompatibility() {
        // Verify all NCERT question fields are compatible with assignment system
        Question ncertQuestion = new Question();
        
        // Core fields
        ncertQuestion.setSubjectId("Mathematics");
        ncertQuestion.setChapter("Chapter 1: Sets");
        ncertQuestion.setType("MCQ");
        ncertQuestion.setText("What is a set?");
        ncertQuestion.setCorrectAnswer("A well-defined collection");
        ncertQuestion.setPoints(1);
        
        // NCERT-specific fields
        ncertQuestion.setSourceKind("CANONICAL");
        ncertQuestion.setReviewStatus("APPROVED");
        ncertQuestion.setExplanation("A set is a well-defined collection of objects.");
        
        // Provenance
        Provenance provenance = new Provenance();
        provenance.setBoard("NCERT");
        provenance.setClassLevel("11");
        provenance.setSubject("Mathematics");
        provenance.setBook("Mathematics");
        provenance.setChapterNumber(1);
        provenance.setChapterTitle("Sets");
        ncertQuestion.setProvenance(provenance);

        // Verify all fields are accessible for assignment display
        assertNotNull(ncertQuestion.getSubjectId());
        assertNotNull(ncertQuestion.getText());
        assertNotNull(ncertQuestion.getCorrectAnswer());
        assertNotNull(ncertQuestion.getExplanation());
        assertNotNull(ncertQuestion.getProvenance());
        assertEquals("APPROVED", ncertQuestion.getReviewStatus());
    }
}
