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

    @Field("source_kind") // CANONICAL, DERIVED
    private String sourceKind;

    @Field("review_status") // DRAFT, APPROVED, REJECTED
    private String reviewStatus;

    @Field("provenance")
    private Provenance provenance;

    @Field("language")
    private String language;

    public String getCorrectAnswer() {
        return correctAnswer != null ? correctAnswer : legacyCorrectAnswer;
    }
}
