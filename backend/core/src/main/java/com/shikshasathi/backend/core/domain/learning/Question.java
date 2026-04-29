package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.List;

@Getter
@Setter
@Document(collection = "questions")
public class Question extends BaseEntity {

    @Id
    private String id;

    @Field("subject_id")
    private String subjectId;

    @Field("teacher_id")
    private String teacherId;

    @Field("chapter")
    private String chapter;

    @Field("topic")
    private String topic;

    @Field("text")
    private String text;

    @Field("type") // MULTIPLE_CHOICE, SHORT_ANSWER, ESSAY
    private String type;

    @Field("options")
    private List<String> options;

    @Field("correct_answer")
    private String correctAnswer;

    @Getter(AccessLevel.NONE)
    @Field("correctAnswer")
    private String legacyCorrectAnswer;

    @Field("points")
    private Integer points;

    @Field("explanation")
    private String explanation;

    @Field("source_kind") // CANONICAL, DERIVED, EXEMPLAR
    private String sourceKind;

    @Field("review_status") // DRAFT, APPROVED, REJECTED, PUBLISHED
    private String reviewStatus;

    @Field("provenance")
    private Provenance provenance;

    @Field("language")
    private String language;

    // Exemplar-specific fields
    @Field("question_id")
    private String questionId;

    @Field("difficulty") // easy, medium, hard
    private String difficulty;

    @Field("blooms_level") // remember, understand, apply, analyze, evaluate, create
    private String bloomsLevel;

    @Field("qa_flags")
    private List<String> qaFlags;

    @Field("review_state") // source review state: approved, rejected
    private String reviewState;

    @Field("source_pages")
    private List<Integer> sourcePages;

    // Derived question metadata
    @Field("source_canonical_question_ids")
    private List<String> sourceCanonicalQuestionIds;

    @Field("derived_from_chapter_id")
    private String derivedFromChapterId;

    @Field("generation_run_id")
    private String generationRunId;

    @Field("generation_rationale")
    private String generationRationale;

    @Field("reviewer_notes")
    private String reviewerNotes;

    public String getCorrectAnswer() {
        return correctAnswer != null ? correctAnswer : legacyCorrectAnswer;
    }
}
