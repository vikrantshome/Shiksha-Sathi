package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.AssignmentReportDTO;
import com.shikshasathi.backend.api.dto.AssignmentWithStats;
import com.shikshasathi.backend.api.dto.QuestionPerformance;
import com.shikshasathi.backend.api.dto.StudentAssignmentDTO;
import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.api.events.NotificationEvent;
import com.shikshasathi.backend.core.domain.learning.Assignment;
import com.shikshasathi.backend.core.domain.learning.AssignmentSubmission;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.school.ClassEntity;
import com.shikshasathi.backend.core.domain.user.User;
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
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public AssignmentReportDTO getAssignmentReport(String assignmentId, String teacherEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
                
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view this assignment's report");
        }

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
        int score = safeScore(submission);
        String fallbackRollNumber = firstNonBlank(submission.getStudentRollNumber(), submission.getStudentId());
        String fallbackName = fallbackRollNumber == null ? "Unknown Student" : "Student " + fallbackRollNumber;

        return userRepository.findById(submission.getStudentId())
                .map(u -> SubmissionDTO.builder()
                        .id(submission.getId())
                        .assignmentId(submission.getAssignmentId())
                        .studentId(submission.getStudentId())
                        .studentName(firstNonBlank(submission.getStudentName(), u.getName(), fallbackName))
                        .studentRollNumber(firstNonBlank(submission.getStudentRollNumber(), u.getRollNumber(), fallbackRollNumber, "N/A"))
                        .answers(submission.getAnswers())
                        .score(score)
                        .submittedAt(submission.getSubmittedAt())
                        .status(submission.getStatus())
                        .build())
                .orElse(SubmissionDTO.builder()
                        .id(submission.getId())
                        .assignmentId(submission.getAssignmentId())
                        .studentId(submission.getStudentId())
                        .studentName(firstNonBlank(submission.getStudentName(), fallbackName))
                        .studentRollNumber(firstNonBlank(submission.getStudentRollNumber(), fallbackRollNumber, "N/A"))
                        .answers(submission.getAnswers())
                        .score(score)
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
            ? submissions.stream().mapToInt(this::safeScore).average().orElse(0.0)
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

    private int safeScore(AssignmentSubmission submission) {
        return submission.getScore() == null ? 0 : submission.getScore();
    }

    private String firstNonBlank(String... candidates) {
        for (String candidate : candidates) {
            if (candidate != null && !candidate.isBlank()) {
                return candidate;
            }
        }
        return null;
    }

    public List<AssignmentWithStats> getAssignmentsWithStatsForTeacher(String teacherId, String email) {
        User teacher = userRepository.findByEmail(email).orElse(null);
        if (teacher == null || !teacher.getId().equals(teacherId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized assignment fetch for mismatched teacher");
        }
        
        List<Assignment> assignments = assignmentRepository.findByTeacherId(teacherId);
        
        return assignments.stream().map(assignment -> {
            List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignment.getId());
            return mapToStats(assignment, submissions);
        }).collect(Collectors.toList());
    }

    public List<Assignment> getAssignmentsByClass(String classId, String email) {
        User teacher = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        ClassEntity classEntity = classRepository.findById(classId)
            .orElseThrow(() -> new RuntimeException("Class not found"));
            
        if (classEntity.getTeacherIds() == null || !classEntity.getTeacherIds().contains(teacher.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to fetch assignments for this class");
        }
        
        return assignmentRepository.findByClassId(classId);
    }

    public StudentAssignmentDTO getAssignmentByLinkId(String linkId) {
        Assignment assignment = assignmentRepository.findFirstByIdStartingWith(linkId)
                .or(() -> assignmentRepository.findAll().stream()
                        .filter(candidate -> candidate.getId() != null && candidate.getId().startsWith(linkId))
                        .findFirst())
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        List<StudentQuestionDTO> questions = assignment.getQuestionIds().stream()
                .map(qId -> {
                    Question q = questionRepository.findById(qId).orElse(null);
                    if (q == null) return null;
                    return StudentQuestionDTO.builder()
                            .id(q.getId())
                            .subject(q.getSubjectId())
                            .grade(null)
                            .chapter(q.getChapter())
                            .topic(q.getTopic())
                            .type(q.getType())
                            .text(q.getText())
                            .options(q.getOptions())
                            .marks(q.getPoints())
                            .build();
                })
                .filter(q -> q != null)
                .collect(Collectors.toList());

        return StudentAssignmentDTO.builder()
                .id(assignment.getId())
                .title(assignment.getTitle())
                .classId(assignment.getClassId())
                .dueDate(assignment.getDueDate())
                .totalMarks(assignment.getMaxScore())
                .questions(questions)
                .build();
    }

    public List<Assignment> getAssignmentsByTeacher(String teacherId, String email) {
        User teacher = userRepository.findByEmail(email).orElse(null);
        if (teacher == null || !teacher.getId().equals(teacherId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return assignmentRepository.findByTeacherId(teacherId);
    }

    public Assignment createAssignment(Assignment assignment, String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        if (assignment.getQuestionIds() == null || assignment.getQuestionIds().isEmpty()) {
            throw new IllegalArgumentException("Assignment must have at least one question.");
        }
        if (assignment.getMaxScore() == null || assignment.getMaxScore() <= 0) {
            throw new IllegalArgumentException("Assignment must have a valid max score.");
        }
        
        assignment.setTeacherId(teacher.getId());
        assignment.setStatus("DRAFT");
        return assignmentRepository.save(assignment);
    }

    public Assignment publishAssignment(String assignmentId, String teacherEmail) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
                
        User teacher = userRepository.findByEmail(teacherEmail)
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
            
        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to publish this assignment");
        }
        
        assignment.setStatus("PUBLISHED");
        Assignment saved = assignmentRepository.save(assignment);
        eventPublisher.publishEvent(new NotificationEvent(this, teacher.getId(), "Assignment published: " + assignment.getTitle()));
        return saved;
    }
}
