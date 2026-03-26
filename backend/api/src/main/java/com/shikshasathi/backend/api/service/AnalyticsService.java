package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;

    public Map<String, Object> getTeacherDashboardAnalytics(String teacherId) {
        Map<String, Object> analytics = new HashMap<>();
        long totalAssignments = assignmentRepository.findByTeacherId(teacherId).size();
        
        // This is a simplified analytic. In a real scenario, we would aggregate submissions.
        analytics.put("totalAssignmentsPublished", totalAssignments);
        analytics.put("averageClassScore", 82.5); // Dummy
        
        return analytics;
    }
}
