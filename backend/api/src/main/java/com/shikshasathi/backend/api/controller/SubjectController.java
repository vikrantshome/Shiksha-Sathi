package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.SubjectService;
import com.shikshasathi.backend.core.domain.learning.Subject;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping("/school/{schoolId}")
    public ResponseEntity<List<Subject>> getSubjects(@PathVariable String schoolId) {
        return ResponseEntity.ok(subjectService.getSubjectsBySchool(schoolId));
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@RequestBody Subject subject) {
        return ResponseEntity.ok(subjectService.createSubject(subject));
    }
}
