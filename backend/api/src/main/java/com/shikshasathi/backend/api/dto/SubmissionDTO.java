package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SubmissionDTO {
    private String id;
    private String assignmentId;
    private String assignmentTitle;
    private String studentId;
    private String studentName;
    private String studentRollNumber;
    private String school; // School/Institute name
    private String studentClass; // Class/Grade (e.g., "10")
    private String section; // Section/Division (e.g., "A")
    private Map<String, Object> answers;
    private Integer score;
    private Integer totalMarks;
    private Instant submittedAt;
    private String status;
    /** AI-graded feedback per question (only populated when fetching a single submission for results display). */
    private List<QuestionFeedbackDTO> feedback;
}
