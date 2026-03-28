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

    @Field("chapter_number")
    private Integer chapterNumber;

    @Field("chapter_title")
    private String chapterTitle;

    @Field("source_file")
    private String sourceFile;

    @Field("page_numbers")
    private String pageNumbers; // e.g., "12-15"

    @Field("section")
    private String section; // In-text, Exercise, etc.
}
