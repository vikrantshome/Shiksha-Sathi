package com.shikshasathi.backend.api.dto.quiz;

import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class StudentQuizDTO {
    private String id;
    private String title;
    private Integer timePerQuestionSec;
    private Integer totalMarks;
    private List<StudentQuestionDTO> questions;
}

