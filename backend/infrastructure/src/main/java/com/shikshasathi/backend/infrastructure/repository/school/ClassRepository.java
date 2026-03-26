package com.shikshasathi.backend.infrastructure.repository.school;

import com.shikshasathi.backend.core.domain.school.ClassEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRepository extends MongoRepository<ClassEntity, String> {
    List<ClassEntity> findBySchoolId(String schoolId);
    List<ClassEntity> findByTeacherIdsContaining(String teacherId);
    List<ClassEntity> findByStudentIdsContaining(String studentId);
}
