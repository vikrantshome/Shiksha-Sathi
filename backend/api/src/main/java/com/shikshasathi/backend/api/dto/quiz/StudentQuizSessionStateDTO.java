package com.shikshasathi.backend.api.dto.quiz;

import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class StudentQuizSessionStateDTO {
    private String sessionId;
    private String sessionCode;
    private String quizId;
    private String quizTitle;
    private String status;
    private long revision;
    private boolean locked;
    private int currentQuestionIndex;
    private int totalQuestions;
    private Integer timePerQuestionSec;

    private StudentQuestionDTO currentQuestion;
    private Instant questionEndsAt;
    private Integer secondsRemaining;

    private List<LeaderboardEntryDTO> leaderboard;
    private Integer myScore;
    private Integer myRank;
    private String myAnswer;

    // Reveal-only fields (present when status is REVEAL or ENDED)
    private String correctAnswer;
    private Boolean myCorrect;
    private Integer myPointsAwarded;
}
