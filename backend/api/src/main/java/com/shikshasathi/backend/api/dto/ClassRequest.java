package com.shikshasathi.backend.api.dto;

import lombok.Data;

@Data
public class ClassRequest {
    private String name;
    private String section;
    private int studentCount;
}
