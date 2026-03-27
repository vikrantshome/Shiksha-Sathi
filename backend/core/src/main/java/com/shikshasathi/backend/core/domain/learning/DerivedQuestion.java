package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Map;

/**
 * Represents a derived practice question generated from canonical NCERT content.
 * Derived questions are AI-generated variations that test the same concepts
 * as canonical questions but with different wording, contexts, or difficulty levels.
 */
@Getter
@Setter
@Document(collection = "questions")
public class DerivedQuestion extends BaseEntity {

    @Id
    private String id;

    /** Reference to the canonical question this was derived from */
    @Field("derived_from")
    private String derivedFrom;

    /** Type of variation: REPHRASED, CONTEXT_CHANGED, DIFFICULTY_MODIFIED, TYPE_CHANGED */
    @Field("variation_type")
    private String variationType;

    /** Difficulty level: BASIC, STANDARD, ADVANCED */
    @Field("difficulty_level")
    private String difficultyLevel;

    /** The question text */
    @Field("text")
    private String text;

    /** Question type: MCQ, SHORT_ANSWER, LONG_ANSWER, TRUE_FALSE, FILL_IN_BLANKS */
    @Field("type")
    private String type;

    /** Options for MCQ questions */
    @Field("options")
    private String[] options;

    /** The correct answer */
    @Field("correct_answer")
    private String correctAnswer;

    /** Detailed explanation of the answer */
    @Field("explanation")
    private String explanation;

    /** The learning concept being tested */
    @Field("concept_tested")
    private String conceptTested;

    /** Subject ID for filtering */
    @Field("subject_id")
    private String subjectId;

    /** Chapter information (deprecated but kept for compatibility) */
    @Field("chapter")
    private String chapter;

    /** Full provenance information linking to NCERT source */
    @Field("provenance")
    private Provenance provenance;

    /** Review status: PENDING, APPROVED, REJECTED */
    @Field("review_status")
    private String reviewStatus;

    /** Points/marks for this question */
    @Field("points")
    private Integer points;

    /** Metadata about the AI generation */
    @Field("generation_metadata")
    private Map<String, Object> generationMetadata;

    /** Source kind - always DERIVED for this class */
    @Field("source_kind")
    private String sourceKind = "DERIVED";
}
