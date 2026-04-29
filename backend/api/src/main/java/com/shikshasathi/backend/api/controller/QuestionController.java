package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.ChapterMetaDTO;
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

    private String getLoginIdentity() {
        if (org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication() == null) {
            return "anonymousUser";
        }
        return org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects(
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String classLevel) {
        return ResponseEntity.ok(questionService.getDistinctSubjects(board, classLevel, getLoginIdentity()));
    }

    @GetMapping("/boards")
    public ResponseEntity<List<String>> getBoards() {
        return ResponseEntity.ok(questionService.getDistinctBoards(getLoginIdentity()));
    }

    @GetMapping("/classes")
    public ResponseEntity<List<String>> getClasses(@RequestParam(required = false) String board) {
        return ResponseEntity.ok(questionService.getDistinctClasses(board, getLoginIdentity()));
    }

    @GetMapping("/books")
    public ResponseEntity<List<String>> getBooks(
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String subject) {
        return ResponseEntity.ok(questionService.getDistinctBooks(board, classLevel, subject, getLoginIdentity()));
    }

    @GetMapping("/chapters")
    public ResponseEntity<List<String>> getChapters(
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String book,
            @RequestParam(required = false) String classLevel) {
        return ResponseEntity.ok(questionService.getDistinctChapters(board, subjectId, book, classLevel, getLoginIdentity()));
    }

    @GetMapping("/chapters-meta")
    public ResponseEntity<List<ChapterMetaDTO>> getChapterMeta(
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String book,
            @RequestParam(required = false, defaultValue = "false") Boolean visibleOnly
    ) {
        return ResponseEntity.ok(questionService.getChapterMeta(board, classLevel, subjectId, book, visibleOnly, getLoginIdentity()));
    }

    @GetMapping("/counts-by-class")
    public ResponseEntity<java.util.Map<String, Long>> getCountsByClass() {
        return ResponseEntity.ok(questionService.getCountsByClass(getLoginIdentity()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Question>> searchQuestions(
            @RequestParam(required = false) String board,
            @RequestParam(required = false) String classLevel,
            @RequestParam(required = false) String subjectId,
            @RequestParam(required = false) String book,
            @RequestParam(required = false) Integer chapterNumber,
            @RequestParam(required = false) String chapterTitle,
            @RequestParam(required = false) String chapter,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "ALL") String type,
            @RequestParam(required = false, defaultValue = "false") Boolean approvedOnly,
            @RequestParam(required = false, defaultValue = "false") Boolean visibleOnly) {
        return ResponseEntity.ok(questionService.searchQuestions(board, classLevel, subjectId, book, chapterNumber, chapterTitle, chapter, q, type, approvedOnly, visibleOnly, getLoginIdentity()));
    }

    /**
     * Get a single question by ID — used by results page to display question details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable String id) {
        return ResponseEntity.ok(questionService.getQuestionById(id));
    }

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.createQuestion(question));
    }

    @PostMapping("/custom")
    public ResponseEntity<Question> createCustomQuestion(@RequestBody Question question) {
        String loginIdentity = getLoginIdentity();
        if ("anonymousUser".equals(loginIdentity)) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(questionService.createCustomQuestion(question, loginIdentity));
    }
}
