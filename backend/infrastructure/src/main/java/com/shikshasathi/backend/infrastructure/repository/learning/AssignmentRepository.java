package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends MongoRepository<Assignment, String> {
    List<Assignment> findByClassId(String classId);
    List<Assignment> findByTeacherId(String teacherId);
    java.util.Optional<Assignment> findFirstByIdStartingWith(String linkId);
    java.util.Optional<Assignment> findByCode(String code);

    // Pagination for large datasets
    Page<Assignment> findByClassId(String classId, Pageable pageable);
    Page<Assignment> findByTeacherId(String teacherId, Pageable pageable);

    // Batch fetch for N+1 elimination
    List<Assignment> findByClassIdIn(List<String> classIds);
}
