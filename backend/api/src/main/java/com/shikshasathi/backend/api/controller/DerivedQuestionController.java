package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.DerivedQuestionService;
import com.shikshasathi.backend.core.domain.learning.DerivedQuestion;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/derived-questions")
@CrossOrigin(origins = "*")
public class DerivedQuestionController {

    @Autowired
    private DerivedQuestionService derivedQuestionService;

    /**
     * Generate derived practice questions from a canonical question.
     * 
     * @param canonicalQuestionId The ID of the canonical question to derive from
     * @param count Number of derived questions to generate (default: 3)
     * @return List of generated derived questions with PENDING status
     */
    @PostMapping("/generate")
    public ResponseEntity<List<DerivedQuestion>> generateDerivedQuestions(
            @RequestBody Map<String, Object> request) {
        
        String canonicalQuestionId = (String) request.get("canonicalQuestionId");
        Integer count = request.get("count") != null ? 
            ((Number) request.get("count")).intValue() : 3;
        
        if (canonicalQuestionId == null || canonicalQuestionId.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        try {
            List<DerivedQuestion> derivedQuestions = 
                derivedQuestionService.generateDerivedQuestions(canonicalQuestionId, count);
            return ResponseEntity.ok(derivedQuestions);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Approve a derived question for teacher visibility.
     */
    @PostMapping("/{id}/approve")
    public ResponseEntity<DerivedQuestion> approveQuestion(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> reviewData) {
        
        String reviewerNotes = reviewData != null ? reviewData.get("notes") : "";
        
        try {
            // TODO: Implement approval logic
            return ResponseEntity.ok().build();
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Reject a derived question.
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<DerivedQuestion> rejectQuestion(
            @PathVariable String id,
            @RequestBody(required = false) Map<String, String> reviewData) {
        
        String reason = reviewData != null ? reviewData.get("reason") : "No reason provided";
        
        try {
            // TODO: Implement rejection logic
            return ResponseEntity.ok().build();
        } catch (UnsupportedOperationException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get derived questions filtered by review status.
     */
    @GetMapping
    public ResponseEntity<List<DerivedQuestion>> getDerivedQuestions(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String canonicalQuestionId) {
        
        // TODO: Implement filtering logic
        return ResponseEntity.ok(List.of());
    }
}
