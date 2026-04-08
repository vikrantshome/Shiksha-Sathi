package com.shikshasathi.backend.api.dto;

import lombok.Data;

@Data
public class ClassRequest {
    private String name;
    private String section;
    private String grade; // Grade/Class level (e.g., "10", "11")
}
