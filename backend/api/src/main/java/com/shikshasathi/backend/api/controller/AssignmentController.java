package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.AssignmentService;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Assignment>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Assignment>> getByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherId));
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        return ResponseEntity.ok(assignmentService.createAssignment(assignment));
    }

    @PostMapping("/{assignmentId}/publish")
    public ResponseEntity<Assignment> publishAssignment(@PathVariable String assignmentId) {
        return ResponseEntity.ok(assignmentService.publishAssignment(assignmentId));
    }
}
