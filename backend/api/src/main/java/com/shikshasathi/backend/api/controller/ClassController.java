package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.ClassRequest;
import com.shikshasathi.backend.api.service.ClassService;
import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/classes")
@RequiredArgsConstructor
public class ClassController {

    private final ClassService classService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<List<ClassEntity>> getMyClasses() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        return ResponseEntity.ok(classService.getClassesForTeacher(teacher.getId()));
    }

    @PostMapping
    public ResponseEntity<ClassEntity> createClass(@RequestBody ClassRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.createClass(request, email));
    }

    @PatchMapping("/{classId}/archive")
    public ResponseEntity<ClassEntity> archiveClass(@PathVariable String classId) {
        return ResponseEntity.ok(classService.archiveClass(classId));
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable String classId) {
        classService.deleteClass(classId);
        return ResponseEntity.noContent().build();
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
