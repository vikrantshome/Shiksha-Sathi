package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChapterMetaDTO {
    private Integer chapterNumber;
    private String chapterTitle;
    private String label;
    private long count;
}

