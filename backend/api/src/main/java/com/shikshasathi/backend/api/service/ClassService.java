package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.ClassRequest;
import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.school.AttendanceRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public List<ClassEntity> getClassesForTeacher(String teacherId) {
        return classRepository.findByTeacherIdsContaining(teacherId);
    }

    public ClassEntity createClass(ClassRequest request, String email) {
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        ClassEntity entity = new ClassEntity();
        entity.setName(request.getName());
        entity.setSection(request.getSection());
        entity.setGrade(request.getGrade());
        entity.setSchoolId(teacher.getSchoolId());

        List<String> teacherIds = new ArrayList<>();
        teacherIds.add(teacher.getId());
        entity.setTeacherIds(teacherIds);

        entity.setActive(true);
        return classRepository.save(entity);
    }

    public void deleteClass(String classId, String email) {
        // Enforce ownership
        getClassById(classId, email);
        classRepository.deleteById(classId);
    }

    public ClassEntity archiveClass(String classId, String email) {
        ClassEntity entity = getClassById(classId, email);
        entity.setActive(false);
        return classRepository.save(entity);
    }

    public ClassEntity getClassById(String id, String email) {
        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        if (classEntity.getTeacherIds() == null || !classEntity.getTeacherIds().contains(teacher.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have access to this class");
        }
        return classEntity;
    }

    public List<User> getStudentsInClass(String classId, String email) {
        ClassEntity entity = getClassById(classId, email);
        if (entity.getStudentIds() == null || entity.getStudentIds().isEmpty()) {
            return new ArrayList<>();
        }
        return userRepository.findAllById(entity.getStudentIds());
    }

    public List<AttendanceRecord> getClassAttendance(String classId, LocalDate date, String email) {
        // Enforce ownership
        getClassById(classId, email);
        return attendanceRepository.findByClassIdAndDate(classId, date);
    }

    public AttendanceRecord markAttendance(String classId, String studentId, LocalDate date, String status, String email) {
        // Enforce ownership
        getClassById(classId, email);

        AttendanceRecord record = attendanceRepository.findByClassIdAndStudentIdAndDate(classId, studentId, date)
                .orElse(new AttendanceRecord());
        
        record.setClassId(classId);
        record.setStudentId(studentId);
        record.setDate(date);
        record.setStatus(status);
        
        return attendanceRepository.save(record);
    }
}
