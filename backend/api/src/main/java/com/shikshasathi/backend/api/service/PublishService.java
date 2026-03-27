package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Provenance;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing NCERT content publishing workflow.
 * SSA-209: Publish Controls
 */
@Service
@RequiredArgsConstructor
public class PublishService {

    private final QuestionRepository questionRepository;

    /**
     * Get publish status for a specific chapter.
     */
    public ChapterPublishStatus getChapterPublishStatus(String board, String classLevel, 
            String subject, String book, Integer chapterNumber) {
        
        List<Question> chapterQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getProvenance() != null)
                .filter(q -> board.equals(q.getProvenance().getBoard()))
                .filter(q -> classLevel.equals(q.getProvenance().getClassLevel()))
                .filter(q -> subject.equals(q.getProvenance().getSubject()))
                .filter(q -> book.equals(q.getProvenance().getBook()))
                .filter(q -> chapterNumber.equals(q.getProvenance().getChapterNumber()))
                .collect(Collectors.toList());

        long draftCount = chapterQuestions.stream()
                .filter(q -> "DRAFT".equals(q.getReviewStatus()))
                .count();
        long approvedCount = chapterQuestions.stream()
                .filter(q -> "APPROVED".equals(q.getReviewStatus()))
                .count();
        long publishedCount = chapterQuestions.stream()
                .filter(q -> "PUBLISHED".equals(q.getReviewStatus()))
                .count();
        long rejectedCount = chapterQuestions.stream()
                .filter(q -> "REJECTED".equals(q.getReviewStatus()))
                .count();

        String overallStatus = "DRAFT";
        if (publishedCount == chapterQuestions.size() && chapterQuestions.size() > 0) {
            overallStatus = "PUBLISHED";
        } else if (approvedCount == chapterQuestions.size() && chapterQuestions.size() > 0) {
            overallStatus = "APPROVED";
        } else if (rejectedCount > 0) {
            overallStatus = "PARTIALLY_REJECTED";
        }

        return ChapterPublishStatus.builder()
                .board(board)
                .classLevel(classLevel)
                .subject(subject)
                .book(book)
                .chapterNumber(chapterNumber)
                .totalQuestions(chapterQuestions.size())
                .draftCount(draftCount)
                .approvedCount(approvedCount)
                .publishedCount(publishedCount)
                .rejectedCount(rejectedCount)
                .overallStatus(overallStatus)
                .build();
    }

    /**
     * Publish all approved questions for a chapter.
     */
    public PublishResult publishChapter(String board, String classLevel, 
            String subject, String book, Integer chapterNumber) {
        
        List<Question> approvedQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getProvenance() != null)
                .filter(q -> board.equals(q.getProvenance().getBoard()))
                .filter(q -> classLevel.equals(q.getProvenance().getClassLevel()))
                .filter(q -> subject.equals(q.getProvenance().getSubject()))
                .filter(q -> book.equals(q.getProvenance().getBook()))
                .filter(q -> chapterNumber.equals(q.getProvenance().getChapterNumber()))
                .filter(q -> "APPROVED".equals(q.getReviewStatus()))
                .collect(Collectors.toList());

        int publishedCount = 0;
        for (Question q : approvedQuestions) {
            q.setReviewStatus("PUBLISHED");
            questionRepository.save(q);
            publishedCount++;
        }

        return PublishResult.builder()
                .publishedCount(publishedCount)
                .status("SUCCESS")
                .message(publishedCount + " questions published successfully")
                .build();
    }

    /**
     * Unpublish questions by ID.
     */
    public PublishResult unpublishQuestions(List<String> questionIds) {
        int unpublishedCount = 0;
        for (String id : questionIds) {
            Question q = questionRepository.findById(id).orElse(null);
            if (q != null) {
                q.setReviewStatus("APPROVED"); // Revert to approved but not published
                questionRepository.save(q);
                unpublishedCount++;
            }
        }

        return PublishResult.builder()
                .unpublishedCount(unpublishedCount)
                .status("SUCCESS")
                .message(unpublishedCount + " questions unpublished successfully")
                .build();
    }

    /**
     * Get all chapters with their publish status for a class.
     */
    public List<ChapterPublishStatus> getClassPublishStatus(String board, String classLevel) {
        // Get all unique chapter combinations
        List<Question> allQuestions = questionRepository.findAll().stream()
                .filter(q -> q.getProvenance() != null)
                .filter(q -> board.equals(q.getProvenance().getBoard()))
                .filter(q -> classLevel.equals(q.getProvenance().getClassLevel()))
                .collect(Collectors.toList());

        return allQuestions.stream()
                .collect(Collectors.groupingBy(q -> 
                    q.getProvenance().getSubject() + "_" + 
                    q.getProvenance().getBook() + "_" + 
                    q.getProvenance().getChapterNumber()))
                .values()
                .stream()
                .map(chapterQuestions -> {
                    Question first = chapterQuestions.get(0);
                    Provenance p = first.getProvenance();
                    return getChapterPublishStatus(
                        p.getBoard(), 
                        p.getClassLevel(), 
                        p.getSubject(), 
                        p.getBook(), 
                        p.getChapterNumber()
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Get summary statistics for publish dashboard.
     */
    public PublishDashboardSummary getDashboardSummary() {
        List<Question> allQuestions = questionRepository.findAll();
        
        long totalQuestions = allQuestions.size();
        long draftCount = allQuestions.stream().filter(q -> "DRAFT".equals(q.getReviewStatus())).count();
        long approvedCount = allQuestions.stream().filter(q -> "APPROVED".equals(q.getReviewStatus())).count();
        long publishedCount = allQuestions.stream().filter(q -> "PUBLISHED".equals(q.getReviewStatus())).count();
        long rejectedCount = allQuestions.stream().filter(q -> "REJECTED".equals(q.getReviewStatus())).count();
        
        long canonicalCount = allQuestions.stream().filter(q -> "CANONICAL".equals(q.getSourceKind())).count();
        long derivedCount = allQuestions.stream().filter(q -> "DERIVED".equals(q.getSourceKind())).count();

        return PublishDashboardSummary.builder()
                .totalQuestions(totalQuestions)
                .draftCount(draftCount)
                .approvedCount(approvedCount)
                .publishedCount(publishedCount)
                .rejectedCount(rejectedCount)
                .canonicalCount(canonicalCount)
                .derivedCount(derivedCount)
                .publishPercentage(totalQuestions > 0 ? (int)(publishedCount * 100 / totalQuestions) : 0)
                .build();
    }

    @lombok.Builder
    @lombok.Getter
    public static class ChapterPublishStatus {
        private String board;
        private String classLevel;
        private String subject;
        private String book;
        private Integer chapterNumber;
        private int totalQuestions;
        private long draftCount;
        private long approvedCount;
        private long publishedCount;
        private long rejectedCount;
        private String overallStatus;
    }

    @lombok.Builder
    @lombok.Getter
    public static class PublishResult {
        private int publishedCount;
        private int unpublishedCount;
        private String status;
        private String message;
    }

    @lombok.Builder
    @lombok.Getter
    public static class PublishDashboardSummary {
        private long totalQuestions;
        private long draftCount;
        private long approvedCount;
        private long publishedCount;
        private long rejectedCount;
        private long canonicalCount;
        private long derivedCount;
        private int publishPercentage;
    }
}
