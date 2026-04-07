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
@Document(collection = "assignment_submissions")
public class AssignmentSubmission extends BaseEntity {

    @Id
    private String id;

    @Field("assignment_id")
    private String assignmentId;

    @Field("student_id")
    private String studentId;

    @Field("student_name")
    private String studentName;

    @Field("student_roll_number")
    private String studentRollNumber;

    @Field("school")
    private String school; // School/Institute name

    @Field("student_class")
    private String studentClass; // Class/Grade (e.g., "10")

    @Field("section")
    private String section; // Section/Division (e.g., "A")

    @Field("answers") // Map of Question ID to Student Answer
    private Map<String, Object> answers;

    @Field("score")
    private Integer score;

    @Field("submitted_at")
    private Instant submittedAt;

    @Field("status") // SUBMITTED, GRADED
    private String status;
}
