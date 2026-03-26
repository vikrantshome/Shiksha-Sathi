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
        entity.setStudentCount(request.getStudentCount());
        entity.setSchoolId(teacher.getSchoolId());
        
        List<String> teacherIds = new ArrayList<>();
        teacherIds.add(teacher.getId());
        entity.setTeacherIds(teacherIds);
        
        entity.setActive(true);
        return classRepository.save(entity);
    }

    public void deleteClass(String classId) {
        classRepository.deleteById(classId);
    }

    public ClassEntity archiveClass(String classId) {
        ClassEntity entity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        entity.setActive(false);
        return classRepository.save(entity);
    }

    public ClassEntity getClassById(String id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    public List<User> getStudentsInClass(String classId) {
        ClassEntity entity = getClassById(classId);
        if (entity.getStudentIds() == null || entity.getStudentIds().isEmpty()) {
            return new ArrayList<>();
        }
        return userRepository.findAllById(entity.getStudentIds());
    }

    public List<AttendanceRecord> getClassAttendance(String classId, LocalDate date) {
        return attendanceRepository.findByClassIdAndDate(classId, date);
    }

    public AttendanceRecord markAttendance(String classId, String studentId, LocalDate date, String status) {
        AttendanceRecord record = attendanceRepository.findByClassIdAndStudentIdAndDate(classId, studentId, date)
                .orElse(new AttendanceRecord());
        
        record.setClassId(classId);
        record.setStudentId(studentId);
        record.setDate(date);
        record.setStatus(status);
        
        return attendanceRepository.save(record);
    }
}
