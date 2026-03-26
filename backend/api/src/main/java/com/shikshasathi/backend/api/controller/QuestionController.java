package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.QuestionService;
import com.shikshasathi.backend.core.domain.learning.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects() {
        return ResponseEntity.ok(questionService.getDistinctSubjects());
    }

    @GetMapping("/chapters")
    public ResponseEntity<List<String>> getChapters(@RequestParam(required = false) String subjectId) {
        return ResponseEntity.ok(questionService.getDistinctChapters(subjectId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Question>> searchQuestions(
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String chapter,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "ALL") String type) {
        return ResponseEntity.ok(questionService.searchQuestions(subjectId, chapter, q, type));
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.createQuestion(question));
    }
}
