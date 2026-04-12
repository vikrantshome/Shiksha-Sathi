package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.ClassRequest;
import com.shikshasathi.backend.api.dto.EnrollStudentRequest;
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

    /**
     * Resolve user from JWT subject (could be email or phone).
     */
    private User resolveUser(String loginIdentity) {
        return userRepository.findByEmail(loginIdentity)
                .or(() -> {
                    java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/{classId}")
    public ResponseEntity<ClassEntity> getClass(@PathVariable String classId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getClassById(classId, loginIdentity));
    }

    @GetMapping("/{classId}/students")
    public ResponseEntity<List<User>> getStudents(@PathVariable String classId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getStudentsInClass(classId, loginIdentity));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ClassEntity>> getMyClasses() {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        User teacher = resolveUser(loginIdentity);
        return ResponseEntity.ok(classService.getClassesForTeacher(teacher.getId()));
    }

    @PostMapping
    public ResponseEntity<ClassEntity> createClass(@RequestBody ClassRequest request) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.createClass(request, loginIdentity));
    }

    @PatchMapping("/{classId}/archive")
    public ResponseEntity<ClassEntity> archiveClass(@PathVariable String classId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.archiveClass(classId, loginIdentity));
    }

    @DeleteMapping("/{classId}")
    public ResponseEntity<Void> deleteClass(@PathVariable String classId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        classService.deleteClass(classId, loginIdentity);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{classId}/attendance")
    public ResponseEntity<List<AttendanceRecord>> getAttendance(
            @PathVariable String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getClassAttendance(classId, date, loginIdentity));
    }

    @PostMapping("/{classId}/attendance")
    public ResponseEntity<AttendanceRecord> markAttendance(
            @PathVariable String classId,
            @RequestBody Map<String, String> request) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        String studentId = request.get("studentId");
        LocalDate date = LocalDate.parse(request.get("date"));
        String status = request.get("status");
        return ResponseEntity.ok(classService.markAttendance(classId, studentId, date, status, loginIdentity));
    }

    @PostMapping("/{classId}/enroll")
    public ResponseEntity<ClassEntity> enrollStudent(
            @PathVariable String classId,
            @RequestBody EnrollStudentRequest request) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.enrollStudent(classId, request, loginIdentity));
    }

    @DeleteMapping("/{classId}/students/{studentId}")
    public ResponseEntity<ClassEntity> removeStudent(
            @PathVariable String classId,
            @PathVariable String studentId) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.removeStudent(classId, studentId, loginIdentity));
    }

    @PostMapping("/{classId}/attendance/bulk")
    public ResponseEntity<List<AttendanceRecord>> markBulkAttendance(
            @PathVariable String classId,
            @RequestBody Map<String, String> request) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        LocalDate date = LocalDate.parse(request.get("date"));
        String status = request.get("status");
        return ResponseEntity.ok(classService.markBulkAttendance(classId, date, status, loginIdentity));
    }

    @GetMapping("/{classId}/attendance/history")
    public ResponseEntity<List<AttendanceRecord>> getAttendanceHistory(
            @PathVariable String classId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        String loginIdentity = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(classService.getAttendanceHistory(classId, startDate, endDate, loginIdentity));
    }

    @GetMapping("/student/{studentId}/attendance")
    public ResponseEntity<List<AttendanceRecord>> getStudentAttendance(
            @PathVariable String studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(classService.getStudentAttendance(studentId, startDate, endDate));
    }
}
