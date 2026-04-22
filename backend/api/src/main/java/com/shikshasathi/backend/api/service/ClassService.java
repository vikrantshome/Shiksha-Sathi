package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.ClassRequest;
import com.shikshasathi.backend.api.dto.EnrollStudentRequest;
import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.school.AttendanceRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<ClassEntity> getClassesForTeacher(String teacherId) {
        return classRepository.findByTeacherIdsContaining(teacherId);
    }

    public ClassEntity createClass(ClassRequest request, String loginIdentity) {
        User teacher = userRepository.findById(loginIdentity)
                .or(() -> userRepository.findByEmail(loginIdentity))
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
        User teacher = userRepository.findById(loginIdentity)
                .or(() -> userRepository.findByEmail(loginIdentity))
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

    /**
     * Enroll a student in a class. If the student doesn't exist, creates a new student account.
     * The student's birth date (DD-MM-YYYY) becomes their default password.
     */
    public ClassEntity enrollStudent(String classId, EnrollStudentRequest request, String loginIdentity) {
        ClassEntity entity = getClassById(classId, loginIdentity);
        User teacher = userRepository.findById(loginIdentity)
                .or(() -> userRepository.findByEmail(loginIdentity))
                .or(() -> {
                    java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        // Validate birth date format DD-MM-YYYY
        String birthDate = request.getBirthDate();
        if (birthDate == null || !birthDate.matches("\\d{2}-\\d{2}-\\d{4}")) {
            throw new RuntimeException("Birth date must be in DD-MM-YYYY format");
        }

        // Check for duplicate roll number in this class
        String newRollNumber = request.getRollNumber();
        if (newRollNumber != null && !newRollNumber.isEmpty()) {
            List<User> existingStudents = userRepository.findAllById(entity.getStudentIds());
            boolean rollExists = existingStudents.stream()
                    .anyMatch(s -> s.getRollNumber() != null && s.getRollNumber().equals(newRollNumber));
            if (rollExists) {
                throw new RuntimeException("Roll number " + newRollNumber + " already exists in this class");
            }
        }

        // Find or create student
        java.util.List<com.shikshasathi.backend.core.domain.user.User> studentUsers = userRepository.findByPhone(request.getPhone());
        User student;

        if (studentUsers.isEmpty()) {
            // Create new student account
            student = new User();
            student.setName(request.getName());
            student.setPhone(request.getPhone());
            student.setPasswordHash(passwordEncoder.encode(birthDate)); // Birth date as password
            student.setRole(Role.STUDENT);
            student.setSchool(teacher.getSchool());
            student.setSchoolId(teacher.getSchoolId());
            student.setStudentClass(entity.getGrade());
            student.setSection(entity.getSection());
            student.setBirthDate(birthDate);
            student.setActive(true);
            student.setCreatedAt(Instant.now());
            // Set roll number if provided
            if (request.getRollNumber() != null && !request.getRollNumber().isEmpty()) {
                student.setRollNumber(request.getRollNumber());
            }
            student = userRepository.save(student);
        } else {
            // Use existing student (first match)
            student = studentUsers.get(0);
            // Update roll number if provided
            if (request.getRollNumber() != null && !request.getRollNumber().isEmpty()) {
                student.setRollNumber(request.getRollNumber());
                student = userRepository.save(student);
            }
        }

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

    public User updateStudent(String studentId, String name, String phone, String rollNumber, String birthDate, String loginIdentity) {
        User teacher = userRepository.findById(loginIdentity)
                .or(() -> userRepository.findByEmail(loginIdentity))
                .or(() -> {
                    java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("Teacher not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        // Check for duplicate roll number if being changed
        if (rollNumber != null && !rollNumber.isEmpty()) {
            List<ClassEntity> teacherClasses = classRepository.findByTeacherIdsContaining(teacher.getId());
            for (ClassEntity cls : teacherClasses) {
                if (cls.getStudentIds() != null && cls.getStudentIds().contains(studentId)) {
                    List<User> classStudents = userRepository.findAllById(cls.getStudentIds());
                    boolean rollExists = classStudents.stream()
                            .filter(s -> !s.getId().equals(studentId))
                            .anyMatch(s -> s.getRollNumber() != null && s.getRollNumber().equals(rollNumber));
                    if (rollExists) {
                        throw new RuntimeException("Roll number " + rollNumber + " already exists in this class");
                    }
                }
            }
        }
        
        if (name != null && !name.isEmpty()) {
            student.setName(name);
        }
        if (phone != null && !phone.isEmpty()) {
            student.setPhone(phone);
        }
        if (rollNumber != null) {
            student.setRollNumber(rollNumber.isEmpty() ? null : rollNumber);
        }
        if (birthDate != null && !birthDate.isEmpty()) {
            if (birthDate.matches("\\d{2}-\\d{2}-\\d{4}")) {
                student.setBirthDate(birthDate);
            }
        }
        return userRepository.save(student);
    }
}
