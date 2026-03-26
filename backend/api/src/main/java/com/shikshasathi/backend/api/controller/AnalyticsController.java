package com.shikshasathi.backend.api.controller;

import com.shikshasathi.backend.api.dto.AnalyticsEventDto;
import com.shikshasathi.backend.api.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @PostMapping("/track")
    public ResponseEntity<Map<String, Boolean>> trackEvent(@RequestBody AnalyticsEventDto dto) {
        analyticsService.trackEvent(dto);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
