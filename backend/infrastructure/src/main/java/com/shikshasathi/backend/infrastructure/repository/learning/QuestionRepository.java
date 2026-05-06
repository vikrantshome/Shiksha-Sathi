package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends MongoRepository<Question, String> {
    List<Question> findByProvenanceSubject(String subject);

    // Batch fetch for N+1 elimination
    List<Question> findByIdIn(List<String> ids);

    // Pagination for large datasets
    Page<Question> findByProvenanceSubject(String subject, Pageable pageable);
    Page<Question> findAll(Pageable pageable);

    // Filtered queries for PublishService (replaces findAll() + in-memory filtering)
    List<Question> findByProvenanceBoardAndProvenanceClassLevelAndProvenanceSubjectAndProvenanceBookAndProvenanceChapterNumber(
            String board, String classLevel, String subject, String book, Integer chapterNumber);

    List<Question> findByProvenanceBoardAndProvenanceClassLevel(
            String board, String classLevel);

    long countByReviewStatus(String reviewStatus);

    long countBySourceKind(String sourceKind);
}
