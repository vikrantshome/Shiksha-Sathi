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

    @GetMapping("/subject/{subjectId}")
    public ResponseEntity<List<Question>> getQuestions(@PathVariable String subjectId) {
        return ResponseEntity.ok(questionService.getQuestionsForSubject(subjectId));
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.createQuestion(question));
    }
}
