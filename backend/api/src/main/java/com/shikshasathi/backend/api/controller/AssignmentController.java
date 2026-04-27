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

    @GetMapping("/{assignmentId}")
    public ResponseEntity<Assignment> getById(@PathVariable String assignmentId) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(assignmentId));
    }

    @GetMapping("/link/{linkId}")
    public ResponseEntity<StudentAssignmentDTO> getByLinkId(@PathVariable String linkId) {
        return ResponseEntity.ok(assignmentService.getAssignmentByLinkId(linkId));
    }

    /**
     * Get assignment by short code (e.g. /api/v1/assignments/code/A3K9X7).
     * Used by students to look up assignments by the code shown to teachers.
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<StudentAssignmentDTO> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(assignmentService.getAssignmentByCode(code));
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<List<Assignment>> getByClass(@PathVariable String classId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.getAssignmentsByClass(classId, email));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Assignment>> getByTeacher(@PathVariable String teacherId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.getAssignmentsByTeacher(teacherId, email));
    }

    @GetMapping("/teacher/{teacherId}/stats")
    public ResponseEntity<List<AssignmentWithStats>> getTeacherStats(@PathVariable String teacherId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.getAssignmentsWithStatsForTeacher(teacherId, email));
    }

    @GetMapping("/{assignmentId}/report")
    public ResponseEntity<AssignmentReportDTO> getReport(@PathVariable String assignmentId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.getAssignmentReport(assignmentId, email));
    }

    @PostMapping
    public ResponseEntity<Assignment> createAssignment(@RequestBody Assignment assignment) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.createAssignment(assignment, email));
    }

    @PostMapping("/{assignmentId}/publish")
    public ResponseEntity<Assignment> publishAssignment(@PathVariable String assignmentId) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(assignmentService.publishAssignment(assignmentId, email));
    }

    @PatchMapping("/{assignmentId}/grades")
    public ResponseEntity<Void> updateGrade(
            @PathVariable String assignmentId,
            @RequestBody com.shikshasathi.backend.api.dto.GradeUpdateRequest request) {
        String email = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        assignmentService.updateGrade(assignmentId, request, email);
        return ResponseEntity.ok().build();
    }
}
