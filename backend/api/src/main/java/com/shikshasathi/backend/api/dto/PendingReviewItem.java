package com.shikshasathi.backend.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingReviewItem {
    private String submissionId;
    private String studentId;
    private String studentName;
    private String questionId;
    private String questionText;
    private String studentAnswer;
    private String correctAnswer;
    private Integer maxMarks;
}