package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ClassGradebookDTO {
    private String classId;
    private String className;
    private List<AssignmentSummary> assignments;
    private List<StudentPerformance> students;

    @Data
    @Builder
    public static class AssignmentSummary {
        private String id;
        private String title;
        private Integer maxScore;
    }

    @Data
    @Builder
    public static class StudentPerformance {
        private String studentId;
        private String studentName;
        private String studentRollNumber;
        private Map<String, Integer> scores; // assignmentId -> score
        private Double averagePercentage;
    }
}
