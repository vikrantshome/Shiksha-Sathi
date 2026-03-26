package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.AssignmentReportDTO;
import com.shikshasathi.backend.api.dto.AssignmentWithStats;
import com.shikshasathi.backend.api.service.AssignmentService;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.shikshasathi.backend.api.dto.StudentAssignmentDTO;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @GetMapping("/link/{linkId}")
    public ResponseEntity<StudentAssignmentDTO> getByLinkId(@PathVariable String linkId) {
        return ResponseEntity.ok(assignmentService.getAssignmentByLinkId(linkId));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Assignment>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Assignment>> getByTeacher(@PathVariable String teacherId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherId));
    }

    @GetMapping("/teacher/{teacherId}/stats")
    public ResponseEntity<List<AssignmentWithStats>> getTeacherStats(@PathVariable String teacherId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsWithStatsForTeacher(teacherId));
    }

    @GetMapping("/{assignmentId}/report")
    public ResponseEntity<AssignmentReportDTO> getReport(@PathVariable String assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentReport(assignmentId));
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
