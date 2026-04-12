package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Getter
@Setter
@Document(collection = "quiz_session_answers")
public class QuizSessionAnswer extends BaseEntity {

    @Id
    private String id;

    @Field("session_id")
    private String sessionId;

    @Field("student_id")
    private String studentId;

    @Field("question_id")
    private String questionId;

    @Field("question_index")
    private Integer questionIndex;

    @Field("answer")
    private String answer;

    @Field("submitted_at")
    private Instant submittedAt;

    @Field("is_correct")
    private Boolean isCorrect;

    @Field("points_awarded")
    private Integer pointsAwarded;

    @Field("time_ms")
    private Long timeMs;
}

