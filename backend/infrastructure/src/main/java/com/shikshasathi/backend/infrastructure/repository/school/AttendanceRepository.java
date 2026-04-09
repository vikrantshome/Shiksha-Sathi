package com.shikshasathi.backend.infrastructure.repository.school;

import com.shikshasathi.backend.core.domain.school.AttendanceRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends MongoRepository<AttendanceRecord, String> {

    @Query("{ 'class_id': ?0, 'date': ?1 }")
    List<AttendanceRecord> findByClassIdAndDate(String classId, String date);

    @Query("{ 'class_id': ?0, 'student_id': ?1, 'date': ?2 }")
    Optional<AttendanceRecord> findByClassIdAndStudentIdAndDate(String classId, String studentId, String date);

    @Query("{ 'class_id': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<AttendanceRecord> findByClassIdAndDateBetween(String classId, String startDate, String endDate);

    @Query("{ 'student_id': ?0, 'date': { $gte: ?1, $lte: ?2 } }")
    List<AttendanceRecord> findByStudentIdAndDateBetween(String studentId, String startDate, String endDate);
}
