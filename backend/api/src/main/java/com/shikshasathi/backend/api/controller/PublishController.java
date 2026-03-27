package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.PublishService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for NCERT content publishing workflow.
 * SSA-209: Publish Controls
 */
@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class PublishController {

    private final PublishService publishService;

    /**
     * Get publish status for a specific chapter.
     */
    @GetMapping("/publish-status")
    public ResponseEntity<PublishService.ChapterPublishStatus> getChapterPublishStatus(
            @RequestParam String board,
            @RequestParam String classLevel,
            @RequestParam String subject,
            @RequestParam String book,
            @RequestParam Integer chapterNumber) {
        return ResponseEntity.ok(publishService.getChapterPublishStatus(
                board, classLevel, subject, book, chapterNumber));
    }

    /**
     * Get publish status for all chapters in a class.
     */
    @GetMapping("/publish-status/summary")
    public ResponseEntity<List<PublishService.ChapterPublishStatus>> getClassPublishStatus(
            @RequestParam String board,
            @RequestParam String classLevel) {
        return ResponseEntity.ok(publishService.getClassPublishStatus(board, classLevel));
    }

    /**
     * Get dashboard summary statistics.
     */
    @GetMapping("/publish-dashboard")
    public ResponseEntity<PublishService.PublishDashboardSummary> getDashboardSummary() {
        return ResponseEntity.ok(publishService.getDashboardSummary());
    }

    /**
     * Publish all approved questions for a chapter.
     */
    @PostMapping("/publish")
    public ResponseEntity<PublishService.PublishResult> publishChapter(
            @RequestBody Map<String, Object> request) {
        String board = (String) request.get("board");
        String classLevel = (String) request.get("classLevel");
        String subject = (String) request.get("subject");
        String book = (String) request.get("book");
        Integer chapterNumber = (Integer) request.get("chapterNumber");

        return ResponseEntity.ok(publishService.publishChapter(
                board, classLevel, subject, book, chapterNumber));
    }

    /**
     * Unpublish questions by ID.
     */
    @PostMapping("/unpublish")
    public ResponseEntity<PublishService.PublishResult> unpublishQuestions(
            @RequestBody Map<String, List<String>> request) {
        List<String> questionIds = request.get("questionIds");
        return ResponseEntity.ok(publishService.unpublishQuestions(questionIds));
    }
}
