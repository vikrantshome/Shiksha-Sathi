package com.shikshasathi.backend.api.dto.quiz;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LeaderboardEntryDTO {
    private int rank;
    private String displayName;
    private int score;
    private boolean isMe;
}

