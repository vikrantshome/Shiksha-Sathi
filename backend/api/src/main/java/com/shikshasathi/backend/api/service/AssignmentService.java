package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.AssignmentReportDTO;
import com.shikshasathi.backend.api.dto.AssignmentWithStats;
import com.shikshasathi.backend.api.dto.QuestionPerformance;
import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.AssignmentSubmissionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.school.ClassRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final AssignmentSubmissionRepository submissionRepository;
    private final ClassRepository classRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public AssignmentReportDTO getAssignmentReport(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        List<SubmissionDTO> submissionDTOs = submissions.stream()
                .map(this::mapSubmissionToDTO)
                .collect(Collectors.toList());

        List<QuestionPerformance> questionStats = assignment.getQuestionIds().stream()
                .map(qId -> {
                    Question question = questionRepository.findById(qId).orElse(null);
                    if (question == null) return null;

                    long correctCount = submissions.stream()
                            .filter(sub -> {
                                Object answer = sub.getAnswers().get(qId);
                                return answer != null && answer.toString().equalsIgnoreCase(question.getCorrectAnswer());
                            })
                            .count();

                    int correctPercentage = submissions.isEmpty() ? 0 : (int) (correctCount * 100 / submissions.size());

                    return QuestionPerformance.builder()
                            .questionId(qId)
                            .text(question.getText())
                            .topic("Question " + (assignment.getQuestionIds().indexOf(qId) + 1))
                            .marks(question.getPoints())
                            .correctPercentage(correctPercentage)
                            .build();
                })
                .filter(q -> q != null)
                .collect(Collectors.toList());

        AssignmentWithStats stats = mapToStats(assignment, submissions);

        return AssignmentReportDTO.builder()
                .assignment(stats)
                .submissions(submissionDTOs)
                .questionStats(questionStats)
                .build();
    }

    private SubmissionDTO mapSubmissionToDTO(AssignmentSubmission submission) {
        return userRepository.findById(submission.getStudentId())
                .map(u -> SubmissionDTO.builder()
                        .id(submission.getId())
                        .assignmentId(submission.getAssignmentId())
                        .studentId(submission.getStudentId())
                        .studentName(u.getName())
                        .studentRollNumber(u.getRollNumber())
                        .answers(submission.getAnswers())
                        .score(submission.getScore())
                        .submittedAt(submission.getSubmittedAt())
                        .status(submission.getStatus())
                        .build())
                .orElse(SubmissionDTO.builder()
                        .id(submission.getId())
                        .assignmentId(submission.getAssignmentId())
                        .studentId(submission.getStudentId())
                        .studentName("Unknown Student")
                        .studentRollNumber("N/A")
                        .answers(submission.getAnswers())
                        .score(submission.getScore())
                        .submittedAt(submission.getSubmittedAt())
                        .status(submission.getStatus())
                        .build());
    }

    private AssignmentWithStats mapToStats(Assignment assignment, List<AssignmentSubmission> submissions) {
        String className = "Unknown Class";
        if (assignment.getClassId() != null) {
            className = classRepository.findById(assignment.getClassId())
                    .map(c -> c.getName() + " (" + c.getSection() + ")")
                    .orElse("Unknown Class");
        }

        long completionCount = submissions.size();
        double averageScore = completionCount > 0 
            ? submissions.stream().mapToInt(AssignmentSubmission::getScore).average().orElse(0.0)
            : 0.0;

        return AssignmentWithStats.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .className(className)
                .dueDate(assignment.getDueDate())
                .totalMarks(assignment.getMaxScore())
                .linkId(assignment.getId().substring(0, 8))
                .submissionCount(completionCount)
                .averageScore(Math.round(averageScore * 10.0) / 10.0)
                .build();
    }

    public List<AssignmentWithStats> getAssignmentsWithStatsForTeacher(String teacherId) {
        List<Assignment> assignments = assignmentRepository.findByTeacherId(teacherId);
        
        return assignments.stream().map(assignment -> {
            List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignment.getId());
            return mapToStats(assignment, submissions);
        }).collect(Collectors.toList());
    }

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
