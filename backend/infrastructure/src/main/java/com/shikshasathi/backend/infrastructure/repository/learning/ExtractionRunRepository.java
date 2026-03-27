package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.ExtractionRun;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExtractionRunRepository extends MongoRepository<ExtractionRun, String> {
    List<ExtractionRun> findByBoardAndClassLevelAndSubjectAndBookAndChapterNumberOrderByVersionDesc(
            String board, String classLevel, String subject, String book, Integer chapterNumber);

    Optional<ExtractionRun> findFirstByBoardAndClassLevelAndSubjectAndBookAndChapterNumberOrderByVersionDesc(
            String board, String classLevel, String subject, String book, Integer chapterNumber);
}
