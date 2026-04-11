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

    public ClassEntity createClass(ClassRequest request, String loginIdentity) {
        User teacher = userRepository.findByEmail(loginIdentity)
                .or(() -> {
                    java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
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
        getClassById(classId, email);
        classRepository.deleteById(classId);
    }

    public ClassEntity archiveClass(String classId, String email) {
        ClassEntity entity = getClassById(classId, email);
        entity.setActive(false);
        return classRepository.save(entity);
    }

    public ClassEntity getClassById(String id, String loginIdentity) {
        User teacher = userRepository.findByEmail(loginIdentity)
                .or(() -> {
                    java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        ClassEntity classEntity = classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));

        if (classEntity.getTeacherIds() == null || !classEntity.getTeacherIds().contains(teacher.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized: You do not have access to this class");
        }
        return classEntity;
    }

    public List<User> getStudentsInClass(String classId, String loginIdentity) {
        ClassEntity entity = getClassById(classId, loginIdentity);
        if (entity.getStudentIds() == null || entity.getStudentIds().isEmpty()) {
            return new ArrayList<>();
        }
        return userRepository.findAllById(entity.getStudentIds());
    }

    public List<AttendanceRecord> getClassAttendance(String classId, LocalDate date, String loginIdentity) {
        getClassById(classId, loginIdentity);
        return attendanceRepository.findByClassIdAndDate(classId, date.toString());
    }

    public AttendanceRecord markAttendance(String classId, String studentId, LocalDate date, String status, String loginIdentity) {
        getClassById(classId, loginIdentity);
        String dateStr = date.toString();

        AttendanceRecord record = attendanceRepository.findByClassIdAndStudentIdAndDate(classId, studentId, dateStr)
                .orElse(new AttendanceRecord());

        record.setClassId(classId);
        record.setStudentId(studentId);
        record.setDate(LocalDate.parse(dateStr));
        record.setStatus(status);

        return attendanceRepository.save(record);
    }

    public ClassEntity enrollStudent(String classId, String studentPhone, String loginIdentity) {
        ClassEntity entity = getClassById(classId, loginIdentity);
        java.util.List<com.shikshasathi.backend.core.domain.user.User> studentUsers = userRepository.findByPhone(studentPhone);
        if (studentUsers.isEmpty()) {
            throw new RuntimeException("Student not found with phone: " + studentPhone);
        }
        User student = studentUsers.get(0);

        if (entity.getStudentIds() == null) {
            entity.setStudentIds(new ArrayList<>());
        }
        if (entity.getStudentIds().contains(student.getId())) {
            throw new RuntimeException("Student is already enrolled in this class");
        }

        entity.getStudentIds().add(student.getId());
        return classRepository.save(entity);
    }

    public ClassEntity removeStudent(String classId, String studentId, String loginIdentity) {
        ClassEntity entity = getClassById(classId, loginIdentity);
        if (entity.getStudentIds() != null) {
            entity.getStudentIds().remove(studentId);
            return classRepository.save(entity);
        }
        return entity;
    }

    public List<AttendanceRecord> markBulkAttendance(String classId, LocalDate date, String status, String loginIdentity) {
        ClassEntity entity = getClassById(classId, loginIdentity);
        if (entity.getStudentIds() == null || entity.getStudentIds().isEmpty()) {
            return new ArrayList<>();
        }

        String dateStr = date.toString();
        List<AttendanceRecord> records = new ArrayList<>();
        for (String studentId : entity.getStudentIds()) {
            AttendanceRecord record = attendanceRepository.findByClassIdAndStudentIdAndDate(classId, studentId, dateStr)
                    .orElse(new AttendanceRecord());
            record.setClassId(classId);
            record.setStudentId(studentId);
            record.setDate(LocalDate.parse(dateStr));
            record.setStatus(status);
            records.add(attendanceRepository.save(record));
        }
        return records;
    }

    public List<AttendanceRecord> getAttendanceHistory(String classId, LocalDate startDate, LocalDate endDate, String loginIdentity) {
        getClassById(classId, loginIdentity);
        return attendanceRepository.findByClassIdAndDateBetween(classId, startDate.toString(), endDate.toString());
    }

    public List<AttendanceRecord> getStudentAttendance(String studentId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByStudentIdAndDateBetween(studentId, startDate.toString(), endDate.toString());
    }
}
