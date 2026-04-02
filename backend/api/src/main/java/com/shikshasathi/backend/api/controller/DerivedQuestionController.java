package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.DerivedQuestionService;
import com.shikshasathi.backend.core.domain.learning.Question;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/derived-questions")
@CrossOrigin(origins = "*")
public class DerivedQuestionController {

    @Autowired
    private DerivedQuestionService derivedQuestionService;

    /**
     * Generate derived practice questions for an entire chapter.
     */
    @PostMapping("/generate")
    public ResponseEntity<List<Question>> generateChapterBatch(
            @RequestBody Map<String, Object> request) {
        
        String board = (String) request.get("board");
        String classLevel = (String) request.get("classLevel");
        String subjectId = (String) request.get("subjectId");
        String book = (String) request.get("book");
        String chapter = (String) request.get("chapter");
        
        Integer count = request.get("questionsPerChapter") != null ? 
            ((Number) request.get("questionsPerChapter")).intValue() : 5;
        
        if (chapter == null || chapter.isEmpty() || board == null || classLevel == null) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<Question> derivedQuestions = 
                derivedQuestionService.generateChapterBatch(board, classLevel, subjectId, book, chapter, count);
            return ResponseEntity.ok(derivedQuestions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Approve a derived question.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<Question> approveQuestion(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> reviewData) {
        
        String reviewerNotes = reviewData != null ? reviewData.get("notes") : "";
        
        try {
            return ResponseEntity.ok(derivedQuestionService.approveQuestion(id, reviewerNotes));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Reject a derived question.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<Question> rejectQuestion(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> reviewData) {
        
        String reason = reviewData != null ? reviewData.get("reason") : "No reason provided";
        
        try {
            return ResponseEntity.ok(derivedQuestionService.rejectQuestion(id, reason));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Publish all approved derived questions for a chapter.
     */
    @PostMapping("/publish")
    public ResponseEntity<Map<String, Object>> publishApprovedQuestions(
            @RequestBody Map<String, String> request) {
        String chapter = request.get("chapter");
        int publishedCount = derivedQuestionService.publishApprovedQuestions(chapter);
        return ResponseEntity.ok(Map.of("publishedCount", publishedCount, "status", "SUCCESS"));
    }

    /**
     * Get derived questions filtered by review status and chapter.
     */
    @GetMapping
    public ResponseEntity<List<Question>> getDerivedQuestions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String chapter) {
        
        return ResponseEntity.ok(derivedQuestionService.getDerivedQuestions(status, chapter));
    }
}
