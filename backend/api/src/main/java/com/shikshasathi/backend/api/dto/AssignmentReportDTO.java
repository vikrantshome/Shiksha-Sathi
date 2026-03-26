package com.shikshasathi.backend.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AssignmentReportDTO {
    private AssignmentWithStats assignment;
    private List<SubmissionDTO> submissions;
    private List<QuestionPerformance> questionStats;
}
