package com.shikshasathi.backend.api.dto;

import lombok.Data;

import java.util.Map;

@Data
public class AnalyticsEventDto {
    private String event;
    private Map<String, Object> payload;
    private String userAgent;
    private String timestamp;
}
