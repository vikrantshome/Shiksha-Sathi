package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.service.ClassService;
import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ClassEntity>> getTeacherClasses(@PathVariable String teacherId) {
        return ResponseEntity.ok(classService.getClassesForTeacher(teacherId));
    }

    @GetMapping("/{classId}/attendance")
    public ResponseEntity<List<AttendanceRecord>> getAttendance(
            @PathVariable String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(classService.getClassAttendance(classId, date));
    }

    @PostMapping("/{classId}/attendance")
    public ResponseEntity<AttendanceRecord> markAttendance(
            @PathVariable String classId,
            @RequestBody Map<String, String> request) {
        String studentId = request.get("studentId");
        LocalDate date = LocalDate.parse(request.get("date"));
        String status = request.get("status");
        return ResponseEntity.ok(classService.markAttendance(classId, studentId, date, status));
    }
}
