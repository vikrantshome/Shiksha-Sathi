package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;

    public List<Assignment> getAssignmentsByClass(String classId) {
        return assignmentRepository.findByClassId(classId);
    }

    public List<Assignment> getAssignmentsByTeacher(String teacherId) {
        return assignmentRepository.findByTeacherId(teacherId);
    }

    public Assignment createAssignment(Assignment assignment) {
        if (assignment.getQuestionIds() == null || assignment.getQuestionIds().isEmpty()) {
            throw new IllegalArgumentException("Assignment must have at least one question.");
        }
        if (assignment.getMaxScore() == null || assignment.getMaxScore() <= 0) {
            throw new IllegalArgumentException("Assignment must have a valid max score.");
        }
        assignment.setStatus("DRAFT");
        return assignmentRepository.save(assignment);
    }

    public Assignment publishAssignment(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        assignment.setStatus("PUBLISHED");
        return assignmentRepository.save(assignment);
    }
}
