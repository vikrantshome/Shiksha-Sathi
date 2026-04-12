package com.shikshasathi.backend.api.dto.quiz;

import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class TeacherQuizSessionStateDTO {
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
    private String correctAnswer;
    private Instant questionEndsAt;
    private Integer secondsRemaining;

    private List<TeacherParticipantDTO> participants;
    private List<LeaderboardEntryDTO> leaderboard;
    private Map<String, Long> answerDistribution;
    private int totalResponses;
}
