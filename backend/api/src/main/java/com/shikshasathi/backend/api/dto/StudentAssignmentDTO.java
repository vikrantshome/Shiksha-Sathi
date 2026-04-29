package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class StudentAssignmentDTO {
    private String id;
    private String title;
    private String classId;
    private Instant dueDate;
    private Integer totalMarks;
    private List<StudentQuestionDTO> questions;
    private String teacherName;
}
