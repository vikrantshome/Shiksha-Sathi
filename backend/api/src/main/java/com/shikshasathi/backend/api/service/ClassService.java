package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.infrastructure.repository.school.AttendanceRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final AttendanceRepository attendanceRepository;

    public List<ClassEntity> getClassesForTeacher(String teacherId) {
        return classRepository.findByTeacherIdsContaining(teacherId);
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
