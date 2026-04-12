package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@Document(collection = "quiz_attempts")
public class QuizAttempt extends BaseEntity {

    @Id
    private String id;

    @Field("quiz_id")
    private String quizId;

    @Field("student_id")
    private String studentId;

    @Field("started_at")
    private Instant startedAt;

    @Field("submitted_at")
    private Instant submittedAt;

    @Field("answers")
    private Map<String, String> answers;

    @Field("score")
    private Integer score;

    @Field("total_marks")
    private Integer totalMarks;
}

