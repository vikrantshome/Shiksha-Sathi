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
@Document(collection = "quiz_session_participants")
public class QuizSessionParticipant extends BaseEntity {

    @Id
    private String id;

    @Field("session_id")
    private String sessionId;

    @Field("student_id")
    private String studentId;

    @Field("display_name")
    private String displayName;

    @Field("joined_at")
    private Instant joinedAt;

    @Field("last_seen_at")
    private Instant lastSeenAt;

    @Field("score")
    private Integer score;
}

