package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentSubmissionRepository extends MongoRepository<AssignmentSubmission, String> {
    List<AssignmentSubmission> findByAssignmentId(String assignmentId);
    List<AssignmentSubmission> findAllByAssignmentIdIn(List<String> assignmentIds);
    List<AssignmentSubmission> findByStudentId(String studentId);
    List<AssignmentSubmission> findByStudentRollNumber(String studentRollNumber);
    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(String assignmentId, String studentId);
    List<AssignmentSubmission> findByStudentClass(String studentClass);
}
