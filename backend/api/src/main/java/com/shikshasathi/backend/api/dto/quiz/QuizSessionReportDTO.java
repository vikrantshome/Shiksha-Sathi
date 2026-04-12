package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuizSessionReportDTO {
    private String sessionId;
    private String sessionCode;
    private String quizId;
    private String quizTitle;
    private List<LeaderboardEntryDTO> leaderboard;
    private List<QuizQuestionStatDTO> questionStats;
}

