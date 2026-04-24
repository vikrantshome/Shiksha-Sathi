package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.annotation.Transient;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Document(collection = "assignments")
public class Assignment extends BaseEntity {

    @Id
    private String id;

    @Field("title")
    private String title;

    @Field("description")
    private String description;

    @Field("subject_id")
    private String subjectId;

    @Field("class_id")
    private String classId;

    @Field("teacher_id")
    private String teacherId;

    @Field("question_ids")
    private List<String> questionIds;

    @Field("due_date")
    private Instant dueDate;

    @Field("max_score")
    private Integer maxScore;

    @Field("status") // DRAFT, PUBLISHED, CLOSED
    private String status;

    @Field("code")
    private String code; // Short 6-char alphanumeric code for student entry (e.g. "A3K9X7")

    @Transient
    private String teacherName;
}
