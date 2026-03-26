package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.tracking.AnalyticsEventRepository;
import com.shikshasathi.backend.core.domain.tracking.AnalyticsEvent;
import com.shikshasathi.backend.api.dto.AnalyticsEventDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final AnalyticsEventRepository analyticsEventRepository;

    public Map<String, Object> getTeacherDashboardAnalytics(String teacherId) {
        Map<String, Object> analytics = new HashMap<>();
        long totalAssignments = assignmentRepository.findByTeacherId(teacherId).size();
        
        // This is a simplified analytic. In a real scenario, we would aggregate submissions.
        analytics.put("totalAssignmentsPublished", totalAssignments);
        analytics.put("averageClassScore", 82.5); // Dummy
        
        return analytics;
    }

    public void trackEvent(AnalyticsEventDto dto) {
        AnalyticsEvent event = AnalyticsEvent.builder()
                .event(dto.getEvent())
                .payload(dto.getPayload())
                .userAgent(dto.getUserAgent())
                .timestamp(LocalDateTime.now())
                .build();
        analyticsEventRepository.save(event);
    }
}
