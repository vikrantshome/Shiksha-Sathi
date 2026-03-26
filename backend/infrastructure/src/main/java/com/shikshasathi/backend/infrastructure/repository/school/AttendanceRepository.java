package com.shikshasathi.backend.infrastructure.repository.school;

import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<AttendanceRecord, String> {
    List<AttendanceRecord> findByClassIdAndDate(String classId, LocalDate date);
    Optional<AttendanceRecord> findByClassIdAndStudentIdAndDate(String classId, String studentId, LocalDate date);
}
