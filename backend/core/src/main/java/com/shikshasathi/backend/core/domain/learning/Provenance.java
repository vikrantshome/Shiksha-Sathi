package com.shikshasathi.backend.core.domain.learning;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Provenance {

    @Field("extraction_run_id")
    private String extractionRunId;

    @Field("board")
    private String board;

    @Field("class")
    private String classLevel;

    @Field("subject")
    private String subject;

    @Field("book")
    private String book;

    @Field("chapterNumber")
    private Integer chapterNumber;

    @Field("chapterTitle")
    private String chapterTitle;

    @Field("sourceFile")
    private String sourceFile;

    @Field("pageNumbers")
    private String pageNumbers; // e.g., "12-15"

    @Field("section")
    private String section; // In-text, Exercise, etc.
}
