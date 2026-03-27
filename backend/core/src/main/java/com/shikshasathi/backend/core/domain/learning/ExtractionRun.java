package com.shikshasathi.backend.core.domain.learning;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.Map;

@Getter
@Setter
@Document(collection = "extraction_runs")
public class ExtractionRun extends BaseEntity {

    @Id
    private String id;

    @Field("board")
    private String board; // e.g., NCERT

    @Field("class_level")
    private String classLevel; // e.g., 10

    @Field("subject")
    private String subject;

    @Field("book")
    private String book;

    @Field("chapter_number")
    private Integer chapterNumber;

    @Field("chapter_title")
    private String chapterTitle;

    @Field("version")
    private Integer version; // Incremental version for this specific chapter

    @Field("status")
    private String status; // PENDING, COMPLETED, FAILED, APPROVED

    @Field("source_file")
    private String sourceFile;

    @Field("extraction_metadata")
    private Map<String, Object> extractionMetadata; // LLM model, prompt version, etc.

    @Field("question_count")
    private Integer questionCount;
}
