package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Document(collection = "quizzes")
public class Quiz extends BaseEntity {

    @Id
    private String id;

    @Field("teacher_id")
    private String teacherId;

    @Field("class_id")
    private String classId;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("question_ids")
    private List<String> questionIds;

    /**
     * Frozen points-per-question at creation time.
     * If absent for a question, scoring defaults to 1.
     */
    @Field("question_points_map")
    private Map<String, Integer> questionPointsMap;

    @Field("time_per_question_sec")
    private Integer timePerQuestionSec;

    @Field("self_paced_enabled")
    private boolean selfPacedEnabled;

    @Field("self_paced_code")
    private String selfPacedCode;

    @Field("published_at")
    private Instant publishedAt;
}

