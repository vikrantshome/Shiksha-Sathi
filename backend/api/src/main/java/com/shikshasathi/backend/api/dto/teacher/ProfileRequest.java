package com.shikshasathi.backend.api.dto.teacher;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "School is required")
    private String school;
    
    @NotBlank(message = "Board is required")
    private String board;
}
