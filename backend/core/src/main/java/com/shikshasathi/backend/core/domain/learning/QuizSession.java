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
@Document(collection = "quiz_sessions")
public class QuizSession extends BaseEntity {

    @Id
    private String id;

    @Field("quiz_id")
    private String quizId;

    @Field("teacher_id")
    private String teacherId;

    @Field("class_id")
    private String classId;

    @Field("session_code")
    private String sessionCode;

    @Field("status") // LOBBY, LIVE, REVEAL, ENDED
    private String status;

    @Field("current_question_index")
    private Integer currentQuestionIndex;

    @Field("question_started_at")
    private Instant questionStartedAt;

    @Field("question_ends_at")
    private Instant questionEndsAt;

    @Field("locked")
    private boolean locked;

    @Field("ended_at")
    private Instant endedAt;

    @Field("revision")
    private Long revision;
}

