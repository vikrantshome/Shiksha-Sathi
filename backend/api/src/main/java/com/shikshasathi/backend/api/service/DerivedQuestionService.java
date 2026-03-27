package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.DerivedQuestion;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class DerivedQuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    /**
     * Generate derived practice questions from a canonical question.
     * In production, this would call Gemini AI API.
     * For now, returns template-based variations.
     */
    public List<DerivedQuestion> generateDerivedQuestions(String canonicalQuestionId, int count) {
        Question canonical = questionRepository.findById(canonicalQuestionId).orElse(null);
        
        if (canonical == null || !"CANONICAL".equals(canonical.getSourceKind())) {
            throw new IllegalArgumentException("Invalid canonical question ID");
        }

        List<DerivedQuestion> derivedQuestions = new ArrayList<>();
        
        // Generate variations based on the canonical question
        // Type 1: Rephrased question
        if (count >= 1) {
            derivedQuestions.add(createRephrasedQuestion(canonical));
        }
        
        // Type 2: Difficulty modified (harder)
        if (count >= 2) {
            derivedQuestions.add(createAdvancedQuestion(canonical));
        }
        
        // Type 3: Type changed (MCQ to Fill-in-blanks or vice versa)
        if (count >= 3) {
            derivedQuestions.add(createTypeChangedQuestion(canonical));
        }

        // Save with PENDING status
        for (DerivedQuestion dq : derivedQuestions) {
            dq.setReviewStatus("PENDING");
            dq.setGenerationMetadata(Map.of(
                "model", "template-based",
                "generatedAt", Instant.now().toString(),
                "promptVersion", "v1",
                "canonicalQuestionId", canonicalQuestionId
            ));
        }

        return derivedQuestions;
    }

    private DerivedQuestion createRephrasedQuestion(Question canonical) {
        DerivedQuestion derived = new DerivedQuestion();
        derived.setDerivedFrom(canonical.getId());
        derived.setVariationType("REPHRASED");
        derived.setDifficultyLevel("STANDARD");
        derived.setSubjectId(canonical.getSubjectId());
        derived.setChapter(canonical.getChapter());
        derived.setProvenance(canonical.getProvenance());
        derived.setPoints(canonical.getPoints() != null ? canonical.getPoints() : 1);
        
        // Rephrase the question
        derived.setText(rephraseQuestion(canonical.getText()));
        derived.setType(canonical.getType());
        derived.setOptions(canonical.getOptions() != null ? 
            canonical.getOptions().toArray(new String[0]) : null);
        derived.setCorrectAnswer(canonical.getCorrectAnswer());
        derived.setExplanation(canonical.getExplanation());
        derived.setConceptTested(extractConcept(canonical.getText()));
        
        return derived;
    }

    private DerivedQuestion createAdvancedQuestion(Question canonical) {
        DerivedQuestion derived = new DerivedQuestion();
        derived.setDerivedFrom(canonical.getId());
        derived.setVariationType("DIFFICULTY_MODIFIED");
        derived.setDifficultyLevel("ADVANCED");
        derived.setSubjectId(canonical.getSubjectId());
        derived.setChapter(canonical.getChapter());
        derived.setProvenance(canonical.getProvenance());
        derived.setPoints((canonical.getPoints() != null ? canonical.getPoints() : 1) + 1);
        
        derived.setText(enhanceQuestionDifficulty(canonical.getText()));
        derived.setType(canonical.getType());
        derived.setOptions(canonical.getOptions() != null ?
            canonical.getOptions().toArray(new String[0]) : null);
        derived.setCorrectAnswer(canonical.getCorrectAnswer());
        derived.setExplanation(canonical.getExplanation());
        derived.setConceptTested(extractConcept(canonical.getText()));
        
        return derived;
    }

    private DerivedQuestion createTypeChangedQuestion(Question canonical) {
        DerivedQuestion derived = new DerivedQuestion();
        derived.setDerivedFrom(canonical.getId());
        derived.setVariationType("TYPE_CHANGED");
        derived.setDifficultyLevel("STANDARD");
        derived.setSubjectId(canonical.getSubjectId());
        derived.setChapter(canonical.getChapter());
        derived.setProvenance(canonical.getProvenance());
        derived.setPoints(canonical.getPoints() != null ? canonical.getPoints() : 1);
        
        // Change question type
        String newType = changeQuestionType(canonical.getType());
        derived.setType(newType);
        derived.setText(adaptQuestionForType(canonical.getText(), newType));
        boolean isFillInBlanksOrShortAnswer = "FILL_IN_BLANKS".equals(newType) || "SHORT_ANSWER".equals(newType);
        derived.setOptions(isFillInBlanksOrShortAnswer ? null : 
            (canonical.getOptions() != null ? canonical.getOptions().toArray(new String[0]) : null));
        derived.setCorrectAnswer(canonical.getCorrectAnswer());
        derived.setExplanation(canonical.getExplanation());
        derived.setConceptTested(extractConcept(canonical.getText()));
        
        return derived;
    }

    // Helper methods for question transformation
    private String rephraseQuestion(String original) {
        // Simple rephrasing patterns (in production, use AI)
        if (original.startsWith("Which of the following")) {
            return original.replace("Which of the following", "Select the correct option:");
        }
        if (original.startsWith("What is")) {
            return original.replace("What is", "Define");
        }
        if (original.endsWith("?")) {
            return "Answer the following: " + original;
        }
        return "Consider: " + original;
    }

    private String enhanceQuestionDifficulty(String original) {
        // Add complexity to the question
        return original + " Explain your reasoning.";
    }

    private String changeQuestionType(String currentType) {
        if ("MCQ".equals(currentType)) {
            return "FILL_IN_BLANKS";
        }
        return "MCQ";
    }

    private String adaptQuestionForType(String original, String newType) {
        if ("FILL_IN_BLANKS".equals(newType)) {
            // Convert to fill-in-blanks by replacing key term with blank
            String[] words = original.split(" ");
            if (words.length > 3) {
                words[words.length / 2] = "________";
                return String.join(" ", words);
            }
        }
        return original;
    }

    private String extractConcept(String questionText) {
        // Simple concept extraction (in production, use AI classification)
        if (questionText.toLowerCase().contains("photosynthesis")) return "Photosynthesis";
        if (questionText.toLowerCase().contains("magnet")) return "Magnetism";
        if (questionText.toLowerCase().contains("fraction")) return "Fractions";
        if (questionText.toLowerCase().contains("triangle")) return "Geometry";
        if (questionText.toLowerCase().contains("democracy")) return "Civics";
        return "General Knowledge";
    }

    /**
     * Approve a derived question for teacher visibility.
     */
    public DerivedQuestion approveQuestion(String questionId, String reviewerNotes) {
        // Implementation would update review status to APPROVED
        // For now, return placeholder
        throw new UnsupportedOperationException("Not yet implemented");
    }

    /**
     * Reject a derived question.
     */
    public DerivedQuestion rejectQuestion(String questionId, String reason) {
        // Implementation would update review status to REJECTED
        throw new UnsupportedOperationException("Not yet implemented");
    }
}
