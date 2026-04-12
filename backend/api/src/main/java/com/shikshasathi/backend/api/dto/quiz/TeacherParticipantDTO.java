package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TeacherParticipantDTO {
    private String studentId;
    private String displayName;
    private int score;
}

