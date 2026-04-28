package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.AssignmentReportDTO;
import com.shikshasathi.backend.api.dto.AssignmentWithStats;
import com.shikshasathi.backend.api.dto.QuestionPerformance;
import com.shikshasathi.backend.api.dto.StudentAssignmentDTO;
import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import com.shikshasathi.backend.api.dto.SubmissionDTO;
import com.shikshasathi.backend.api.dto.QuestionFeedbackDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
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
    private final AssignmentSubmissionService assignmentSubmissionService;
    private final ClassRepository classRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    /**
     * Get assignment by ID — public access, no auth check.
     * Used by student dashboard to enrich submissions with assignment metadata.
     */
    public Assignment getAssignmentById(String assignmentId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        return enrichWithTeacherName(assignment);
    }

    public AssignmentReportDTO getAssignmentReport(String assignmentId, String loginIdentity) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        User teacher = resolveTeacher(loginIdentity);

        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to view this assignment's report");
        }

        List<AssignmentSubmission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        List<SubmissionDTO> submissionDTOs = submissions.stream()
                .map(s -> {
                    SubmissionDTO dto = mapSubmissionToDTO(s);
                    // Add full feedback for worksheet view
                    try {
                        String feedbackJson = s.getFeedbackJson();
                        if (feedbackJson != null && !feedbackJson.isBlank()) {
                            dto.setFeedback(objectMapper
                                .readValue(feedbackJson, new TypeReference<List<QuestionFeedbackDTO>>() {}));
                        }
                    } catch (Exception e) {
                        // fallback
                    }
                    return dto;
                })
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
                .maxScore(assignment.getMaxScore())
                .linkId(assignment.getId().substring(0, 8))
                .code(assignment.getCode())
                .status(assignment.getStatus())
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

    private Assignment enrichWithTeacherName(Assignment assignment) {
        if (assignment != null && assignment.getTeacherId() != null) {
            userRepository.findById(assignment.getTeacherId())
                .ifPresent(u -> assignment.setTeacherName(u.getName()));
        }
        return assignment;
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
        
        List<Assignment> assignments = assignmentRepository.findByClassId(classId);
        assignments.forEach(this::enrichWithTeacherName);
        return assignments;
    }

    public StudentAssignmentDTO getAssignmentByLinkId(String linkId) {
        Assignment assignment = assignmentRepository.findFirstByIdStartingWith(linkId)
                .or(() -> assignmentRepository.findAll().stream()
                        .filter(candidate -> candidate.getId() != null && candidate.getId().startsWith(linkId))
                        .findFirst())
                .or(() -> assignmentRepository.findByCode(linkId)) // Also try short code lookup
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

    /**
     * Get assignment by short code (e.g. "A3K9X7").
     * Public access — used by students to look up assignments.
     */
    public StudentAssignmentDTO getAssignmentByCode(String code) {
        Assignment assignment = assignmentRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Assignment not found for code: " + code));

        if (!"PUBLISHED".equals(assignment.getStatus())) {
            throw new RuntimeException("Assignment is not yet available.");
        }

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

    public List<Assignment> getAssignmentsByTeacher(String teacherId, String loginIdentity) {
        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(teacherId)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        List<Assignment> assignments = assignmentRepository.findByTeacherId(teacherId);
        assignments.forEach(a -> a.setTeacherName(teacher.getName()));
        return assignments;
    }

    /**
     * Resolve teacher from JWT subject (could be email or phone).
     */
    private User resolveTeacher(String loginIdentity) {
        return userRepository.findByEmail(loginIdentity)
            .or(() -> {
                java.util.List<com.shikshasathi.backend.core.domain.user.User> phoneUsers = userRepository.findByPhone(loginIdentity);
                return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
            })
            .orElseThrow(() -> new RuntimeException("Teacher not found"));
    }

    public Assignment createAssignment(Assignment assignment, String loginIdentity) {
        User teacher = resolveTeacher(loginIdentity);

        if (assignment.getQuestionIds() == null || assignment.getQuestionIds().isEmpty()) {
            throw new IllegalArgumentException("Assignment must have at least one question.");
        }
        if (assignment.getMaxScore() == null || assignment.getMaxScore() <= 0) {
            throw new IllegalArgumentException("Assignment must have a valid max score.");
        }

        assignment.setTeacherId(teacher.getId());
        assignment.setStatus("DRAFT");
        assignment.setCode(generateUniqueCode());
        Assignment saved = assignmentRepository.save(assignment);
        saved.setTeacherName(teacher.getName());
        return saved;
    }

    /**
     * Generate a unique 6-character alphanumeric code for assignment lookup.
     * Retries up to 10 times if collision occurs.
     */
    private String generateUniqueCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Excludes I, O, 0, 1 for readability
        java.util.Random random = new java.util.Random();
        for (int attempt = 0; attempt < 10; attempt++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }
            String code = sb.toString();
            // Check for collision
            if (assignmentRepository.findByCode(code).isEmpty()) {
                return code;
            }
        }
        // Fallback: use timestamp-based code if all retries fail
        return "A" + System.currentTimeMillis() % 100000;
    }

    public Assignment publishAssignment(String assignmentId, String loginIdentity) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        User teacher = resolveTeacher(loginIdentity);
            
        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to publish this assignment");
        }
        
        assignment.setStatus("PUBLISHED");
        Assignment saved = assignmentRepository.save(assignment);
        saved.setTeacherName(teacher.getName());
        eventPublisher.publishEvent(new NotificationEvent(this, teacher.getId(), "Assignment published: " + assignment.getTitle()));
        return saved;
    }

    public void updateGrade(String assignmentId, com.shikshasathi.backend.api.dto.GradeUpdateRequest request, String loginIdentity) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        User teacher = resolveTeacher(loginIdentity);
        if (!teacher.getId().equals(assignment.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized to update grades for this assignment");
        }

        assignmentSubmissionService.updateGrade(assignmentId, request);
    }

    public com.shikshasathi.backend.api.dto.ClassGradebookDTO getClassGradebook(String classId, String loginIdentity) {
        com.shikshasathi.backend.core.domain.school.ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found"));
        
        User teacher = resolveTeacher(loginIdentity);
        // Auth check... (simplifying for brevity)

        List<Assignment> assignments = assignmentRepository.findByClassId(classId);
        List<AssignmentSubmission> submissions = submissionRepository.findByStudentClass(classEntity.getName());

        List<com.shikshasathi.backend.api.dto.ClassGradebookDTO.AssignmentSummary> assignmentSummaries = assignments.stream()
                .map(a -> com.shikshasathi.backend.api.dto.ClassGradebookDTO.AssignmentSummary.builder()
                        .id(a.getId())
                        .title(a.getTitle())
                        .maxScore(a.getMaxScore())
                        .build())
                .collect(Collectors.toList());

        Map<String, List<AssignmentSubmission>> studentSubmissions = submissions.stream()
                .collect(Collectors.groupingBy(AssignmentSubmission::getStudentId));

        List<com.shikshasathi.backend.api.dto.ClassGradebookDTO.StudentPerformance> studentPerformances = studentSubmissions.entrySet().stream()
                .map(entry -> {
                    String studentId = entry.getKey();
                    List<AssignmentSubmission> subs = entry.getValue();
                    AssignmentSubmission first = subs.get(0);

                    Map<String, Integer> scores = subs.stream()
                            .collect(Collectors.toMap(AssignmentSubmission::getAssignmentId, AssignmentSubmission::getScore, (a, b) -> a));

                    double avg = subs.stream()
                            .mapToDouble(s -> {
                                Assignment a = assignments.stream().filter(as -> as.getId().equals(s.getAssignmentId())).findFirst().orElse(null);
                                if (a == null || a.getMaxScore() == 0) return 0.0;
                                return (s.getScore() * 100.0) / a.getMaxScore();
                            })
                            .average().orElse(0.0);

                    return com.shikshasathi.backend.api.dto.ClassGradebookDTO.StudentPerformance.builder()
                            .studentId(studentId)
                            .studentName(first.getStudentName())
                            .studentRollNumber(first.getStudentRollNumber())
                            .scores(scores)
                            .averagePercentage(Math.round(avg * 10.0) / 10.0)
                            .build();
                })
                .collect(Collectors.toList());

        return com.shikshasathi.backend.api.dto.ClassGradebookDTO.builder()
                .classId(classId)
                .className(classEntity.getName() + " (" + classEntity.getSection() + ")")
                .assignments(assignmentSummaries)
                .students(studentPerformances)
                .build();
    }
}
