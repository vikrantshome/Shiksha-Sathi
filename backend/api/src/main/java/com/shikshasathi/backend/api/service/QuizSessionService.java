package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.StudentQuestionDTO;
import com.shikshasathi.backend.api.dto.quiz.*;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Quiz;
import com.shikshasathi.backend.core.domain.learning.QuizSession;
import com.shikshasathi.backend.core.domain.learning.QuizSessionAnswer;
import com.shikshasathi.backend.core.domain.learning.QuizSessionParticipant;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizSessionAnswerRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizSessionParticipantRepository;
import com.shikshasathi.backend.infrastructure.repository.learning.QuizSessionRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class QuizSessionService {

    private final QuizSessionRepository quizSessionRepository;
    private final QuizRepository quizRepository;
    private final QuizSessionParticipantRepository participantRepository;
    private final QuizSessionAnswerRepository answerRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;

    public JoinQuizSessionResponse joinSession(String sessionCode, String studentId) {
        User student = requireStudent(studentId);
        QuizSession session = quizSessionRepository.findBySessionCode(sessionCode)
                .orElseThrow(() -> new RuntimeException("Quiz session not found"));

        if ("ENDED".equals(session.getStatus())) {
            throw new IllegalArgumentException("This quiz session has ended.");
        }
        if (session.isLocked()) {
            throw new IllegalArgumentException("This quiz session is locked.");
        }

        QuizSessionParticipant participant = participantRepository.findBySessionIdAndStudentId(session.getId(), student.getId())
                .orElseGet(() -> {
                    QuizSessionParticipant p = new QuizSessionParticipant();
                    p.setSessionId(session.getId());
                    p.setStudentId(student.getId());
                    p.setDisplayName(student.getName());
                    p.setJoinedAt(Instant.now());
                    p.setScore(0);
                    return p;
                });
        participant.setLastSeenAt(Instant.now());
        if (participant.getScore() == null) {
            participant.setScore(0);
        }
        participantRepository.save(participant);

        bumpRevision(session);

        return JoinQuizSessionResponse.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .status(session.getStatus())
                .build();
    }

    public TeacherQuizSessionStateDTO getTeacherState(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));

        StudentQuestionDTO currentQuestion = null;
        String correctAnswer = null;
        List<String> correctAnswers = null;
        Map<String, Long> distribution = Map.of();
        int totalResponses = 0;
        Integer secondsRemaining = secondsRemaining(session);

        if (session.getCurrentQuestionIndex() != null && session.getCurrentQuestionIndex() >= 0) {
            Question q = currentQuestionForSession(session, quiz);
            if (q != null) {
                currentQuestion = toStudentQuestion(q, quiz, q.getId());
                correctAnswer = q.getCorrectAnswer();
                correctAnswers = q.getCorrectAnswers();
                List<QuizSessionAnswer> answers = answerRepository.findBySessionIdAndQuestionIndex(session.getId(), session.getCurrentQuestionIndex());
                totalResponses = answers.size();
                // For multi-select, split comma-separated answers and count each option individually
                distribution = answers.stream()
                        .flatMap(a -> {
                            String ans = a.getAnswer() == null ? "" : a.getAnswer();
                            if (ans.contains(",")) {
                                return Arrays.stream(ans.split(",")).map(String::trim).filter(s -> !s.isEmpty());
                            }
                            return Stream.of(ans);
                        })
                        .collect(Collectors.groupingBy(s -> s, Collectors.counting()));
            }
        }

        List<QuizSessionParticipant> participants = participantRepository.findBySessionId(session.getId());
        List<LeaderboardEntryDTO> leaderboard = buildLeaderboard(participants, null);

        List<TeacherParticipantDTO> roster = participants.stream()
                .sorted(Comparator.comparingInt((QuizSessionParticipant p) -> p.getScore() == null ? 0 : p.getScore()).reversed())
                .map(p -> TeacherParticipantDTO.builder()
                        .studentId(p.getStudentId())
                        .displayName(p.getDisplayName())
                        .score(p.getScore() == null ? 0 : p.getScore())
                        .build())
                .collect(Collectors.toList());

        return TeacherQuizSessionStateDTO.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .status(session.getStatus())
                .revision(session.getRevision() == null ? 0 : session.getRevision())
                .locked(session.isLocked())
                .currentQuestionIndex(session.getCurrentQuestionIndex() == null ? -1 : session.getCurrentQuestionIndex())
                .totalQuestions(quiz.getQuestionIds() == null ? 0 : quiz.getQuestionIds().size())
                .timePerQuestionSec(quiz.getTimePerQuestionSec())
                .currentQuestion(currentQuestion)
                .correctAnswer(correctAnswer)
                .correctAnswers(correctAnswers)
                .questionEndsAt(session.getQuestionEndsAt())
                .secondsRemaining(secondsRemaining)
                .participants(roster)
                .leaderboard(leaderboard)
                .answerDistribution(distribution)
                .totalResponses(totalResponses)
                .build();
    }

    public StudentQuizSessionStateDTO getStudentState(String sessionId, String studentId) {
        User student = requireStudent(studentId);
        QuizSession session = quizSessionRepository.findById(sessionId).orElseThrow(() -> new RuntimeException("Quiz session not found"));
        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));

        QuizSessionParticipant participant = participantRepository.findBySessionIdAndStudentId(session.getId(), student.getId())
                .orElse(null);

        StudentQuestionDTO currentQuestion = null;
        String correctAnswer = null;
        List<String> correctAnswers = null;
        Boolean myCorrect = null;
        Integer myPoints = null;
        String myAnswer = null;
        List<String> myAnswers = null;
        Integer secondsRemaining = secondsRemaining(session);

        if (session.getCurrentQuestionIndex() != null && session.getCurrentQuestionIndex() >= 0) {
            Question q = currentQuestionForSession(session, quiz);
            if (q != null) {
                currentQuestion = toStudentQuestion(q, quiz, q.getId());

                QuizSessionAnswer existing = answerRepository
                        .findBySessionIdAndStudentIdAndQuestionIndex(session.getId(), student.getId(), session.getCurrentQuestionIndex())
                        .orElse(null);
                if (existing != null) {
                    myAnswer = existing.getAnswer();
                    myAnswers = parseMultiAnswer(myAnswer);
                    myCorrect = existing.getIsCorrect();
                    myPoints = existing.getPointsAwarded();
                }

                if ("REVEAL".equals(session.getStatus()) || "ENDED".equals(session.getStatus())) {
                    correctAnswer = q.getCorrectAnswer();
                    correctAnswers = q.getCorrectAnswers();
                }
            }
        }

        List<QuizSessionParticipant> participants = participantRepository.findBySessionId(session.getId());
        List<LeaderboardEntryDTO> leaderboard = buildLeaderboard(participants, student.getId());
        Integer myScore = participant == null ? 0 : (participant.getScore() == null ? 0 : participant.getScore());
        Integer myRank = leaderboard.stream().filter(LeaderboardEntryDTO::isMe).findFirst().map(LeaderboardEntryDTO::getRank).orElse(null);

        return StudentQuizSessionStateDTO.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .status(session.getStatus())
                .revision(session.getRevision() == null ? 0 : session.getRevision())
                .locked(session.isLocked())
                .currentQuestionIndex(session.getCurrentQuestionIndex() == null ? -1 : session.getCurrentQuestionIndex())
                .totalQuestions(quiz.getQuestionIds() == null ? 0 : quiz.getQuestionIds().size())
                .timePerQuestionSec(quiz.getTimePerQuestionSec())
                .currentQuestion(currentQuestion)
                .questionEndsAt(session.getQuestionEndsAt())
                .secondsRemaining(secondsRemaining)
                .leaderboard(leaderboard)
                .myScore(myScore)
                .myRank(myRank)
                .myAnswer(myAnswer)
                .myAnswers(myAnswers)
                .correctAnswer(correctAnswer)
                .correctAnswers(correctAnswers)
                .myCorrect(myCorrect)
                .myPointsAwarded(myPoints)
                .build();
    }

    public QuizAnswerResponse submitAnswer(String sessionId, String studentId, String answer) {
        User student = requireStudent(studentId);
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Quiz session not found"));
        if (!"LIVE".equals(session.getStatus())) {
            throw new IllegalArgumentException("Quiz is not accepting answers right now.");
        }
        if (session.getCurrentQuestionIndex() == null || session.getCurrentQuestionIndex() < 0) {
            throw new IllegalArgumentException("Quiz has not started yet.");
        }
        if (session.getQuestionEndsAt() != null && Instant.now().isAfter(session.getQuestionEndsAt())) {
            throw new IllegalArgumentException("Time is up for this question.");
        }

        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));
        String questionId = quiz.getQuestionIds().get(session.getCurrentQuestionIndex());
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new RuntimeException("Question not found"));

        QuizSessionAnswer existing = answerRepository
                .findBySessionIdAndStudentIdAndQuestionIndex(sessionId, student.getId(), session.getCurrentQuestionIndex())
                .orElse(null);
        if (existing != null) {
            throw new IllegalArgumentException("Answer already submitted for this question.");
        }

        boolean isCorrect = gradeAnswer(question, answer);
        int points = 0;
        if (isCorrect) {
            int base = pointsFor(quiz, questionId, question);
            int bonus = speedBonusPoints(base, session.getQuestionStartedAt(), session.getQuestionEndsAt());
            points = base + bonus;
        }

        QuizSessionAnswer qa = new QuizSessionAnswer();
        qa.setSessionId(session.getId());
        qa.setStudentId(student.getId());
        qa.setQuestionId(questionId);
        qa.setQuestionIndex(session.getCurrentQuestionIndex());
        qa.setAnswer(answer);
        qa.setSubmittedAt(Instant.now());
        qa.setIsCorrect(isCorrect);
        qa.setPointsAwarded(points);
        if (session.getQuestionStartedAt() != null) {
            qa.setTimeMs(Duration.between(session.getQuestionStartedAt(), qa.getSubmittedAt()).toMillis());
        }
        answerRepository.save(qa);

        QuizSessionParticipant participant = participantRepository.findBySessionIdAndStudentId(session.getId(), student.getId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));
        int currentScore = participant.getScore() == null ? 0 : participant.getScore();
        int newScore = currentScore + points;
        participant.setScore(newScore);
        participant.setLastSeenAt(Instant.now());
        participantRepository.save(participant);

        bumpRevision(session);

        return QuizAnswerResponse.builder()
                .accepted(true)
                .correct(isCorrect)
                .pointsAwarded(points)
                .newScore(newScore)
                .build();
    }

    private int speedBonusPoints(int basePoints, Instant startedAt, Instant endsAt) {
        if (basePoints <= 0 || startedAt == null || endsAt == null) {
            return 0;
        }
        long totalMs = Duration.between(startedAt, endsAt).toMillis();
        if (totalMs <= 0) {
            return 0;
        }
        long remainingMs = Duration.between(Instant.now(), endsAt).toMillis();
        double remainingRatio = Math.max(0d, Math.min(1d, (double) remainingMs / (double) totalMs));

        // Max +50% bonus for the fastest correct answers.
        return (int) Math.floor(basePoints * remainingRatio * 0.5d);
    }

    public QuizSession lockSession(String sessionId, String loginIdentity, boolean locked) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        session.setLocked(locked);
        bumpRevision(session);
        return session;
    }

    public QuizSession startSession(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        if (!"LOBBY".equals(session.getStatus())) {
            return session;
        }
        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));

        session.setStatus("LIVE");
        session.setCurrentQuestionIndex(0);
        session.setQuestionStartedAt(Instant.now());
        session.setQuestionEndsAt(session.getQuestionStartedAt().plusSeconds(Math.max(quiz.getTimePerQuestionSec() == null ? 30 : quiz.getTimePerQuestionSec(), 5)));
        bumpRevision(session);
        return session;
    }

    public QuizSession reveal(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        if (!"LIVE".equals(session.getStatus())) {
            return session;
        }
        session.setStatus("REVEAL");
        bumpRevision(session);
        return session;
    }

    public QuizSession next(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));

        int nextIndex = (session.getCurrentQuestionIndex() == null ? -1 : session.getCurrentQuestionIndex()) + 1;
        if (quiz.getQuestionIds() == null || nextIndex >= quiz.getQuestionIds().size()) {
            session.setStatus("ENDED");
            session.setEndedAt(Instant.now());
            bumpRevision(session);
            return session;
        }

        session.setStatus("LIVE");
        session.setCurrentQuestionIndex(nextIndex);
        session.setQuestionStartedAt(Instant.now());
        session.setQuestionEndsAt(session.getQuestionStartedAt().plusSeconds(Math.max(quiz.getTimePerQuestionSec() == null ? 30 : quiz.getTimePerQuestionSec(), 5)));
        bumpRevision(session);
        return session;
    }

    public QuizSession end(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        session.setStatus("ENDED");
        session.setEndedAt(Instant.now());
        bumpRevision(session);
        return session;
    }

    public QuizSessionReportDTO report(String sessionId, String loginIdentity) {
        QuizSession session = requireTeacherSessionOwner(sessionId, loginIdentity);
        Quiz quiz = quizRepository.findById(session.getQuizId()).orElseThrow(() -> new RuntimeException("Quiz not found"));

        List<QuizSessionParticipant> participants = participantRepository.findBySessionId(session.getId());
        List<LeaderboardEntryDTO> leaderboard = buildLeaderboard(participants, null);

        List<QuizQuestionStatDTO> stats = new ArrayList<>();
        if (quiz.getQuestionIds() != null) {
            for (int idx = 0; idx < quiz.getQuestionIds().size(); idx++) {
                String qId = quiz.getQuestionIds().get(idx);
                Question q = questionRepository.findById(qId).orElse(null);
                if (q == null) {
                    continue;
                }
                List<QuizSessionAnswer> answers = answerRepository.findBySessionIdAndQuestionIndex(session.getId(), idx);
                int total = answers.size();
                int correct = (int) answers.stream().filter(a -> Boolean.TRUE.equals(a.getIsCorrect())).count();
                stats.add(QuizQuestionStatDTO.builder()
                        .questionIndex(idx)
                        .questionId(qId)
                        .text(q.getText())
                        .totalResponses(total)
                        .correctResponses(correct)
                        .build());
            }
        }

        return QuizSessionReportDTO.builder()
                .sessionId(session.getId())
                .sessionCode(session.getSessionCode())
                .quizId(quiz.getId())
                .quizTitle(quiz.getTitle())
                .leaderboard(leaderboard)
                .questionStats(stats)
                .build();
    }

    private QuizSession requireTeacherSessionOwner(String sessionId, String loginIdentity) {
        QuizSession session = quizSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Quiz session not found"));
        User teacher = resolveUserByLoginIdentity(loginIdentity);
        if (teacher.getRole() != Role.TEACHER) {
            throw new org.springframework.security.access.AccessDeniedException("Teacher access required");
        }
        if (!teacher.getId().equals(session.getTeacherId())) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized");
        }
        return session;
    }

    private Question currentQuestionForSession(QuizSession session, Quiz quiz) {
        if (quiz.getQuestionIds() == null) {
            return null;
        }
        int idx = session.getCurrentQuestionIndex() == null ? -1 : session.getCurrentQuestionIndex();
        if (idx < 0 || idx >= quiz.getQuestionIds().size()) {
            return null;
        }
        String questionId = quiz.getQuestionIds().get(idx);
        return questionRepository.findById(questionId).orElse(null);
    }

    private StudentQuestionDTO toStudentQuestion(Question q, Quiz quiz, String questionId) {
        int marks = pointsFor(quiz, questionId, q);
        return StudentQuestionDTO.builder()
                .id(q.getId())
                .subject(q.getSubjectId())
                .grade(null)
                .chapter(q.getChapter())
                .topic(q.getTopic())
                .type(q.getType())
                .text(q.getText())
                .options(q.getOptions())
                .correctAnswer(q.getCorrectAnswer())
                .correctAnswers(q.getCorrectAnswers())
                .marks(marks)
                .build();
    }

    private int pointsFor(Quiz quiz, String questionId, Question q) {
        Map<String, Integer> map = quiz.getQuestionPointsMap();
        if (map != null && map.containsKey(questionId)) {
            return map.getOrDefault(questionId, 1);
        }
        if (q.getPoints() != null && q.getPoints() > 0) {
            return q.getPoints();
        }
        return 1;
    }

    private List<LeaderboardEntryDTO> buildLeaderboard(List<QuizSessionParticipant> participants, String meStudentId) {
        List<QuizSessionParticipant> sorted = participants.stream()
                .sorted(Comparator
                        .comparingInt((QuizSessionParticipant p) -> p.getScore() == null ? 0 : p.getScore())
                        .reversed()
                        .thenComparing(p -> p.getJoinedAt() == null ? Instant.EPOCH : p.getJoinedAt()))
                .collect(Collectors.toList());

        List<LeaderboardEntryDTO> leaderboard = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            QuizSessionParticipant p = sorted.get(i);
            boolean isMe = meStudentId != null && meStudentId.equals(p.getStudentId());
            leaderboard.add(LeaderboardEntryDTO.builder()
                    .rank(i + 1)
                    .displayName(p.getDisplayName())
                    .score(p.getScore() == null ? 0 : p.getScore())
                    .isMe(isMe)
                    .build());
        }

        // Limit to top 10 for payload size
        if (leaderboard.size() > 10) {
            List<LeaderboardEntryDTO> top = new ArrayList<>(leaderboard.subList(0, 10));
            if (meStudentId != null) {
                leaderboard.stream().filter(LeaderboardEntryDTO::isMe).findFirst().ifPresent(me -> {
                    boolean alreadyInTop = top.stream().anyMatch(e -> e.isMe());
                    if (!alreadyInTop) {
                        top.add(me);
                    }
                });
            }
            return top;
        }

        return leaderboard;
    }

    private Integer secondsRemaining(QuizSession session) {
        if (session.getQuestionEndsAt() == null) {
            return null;
        }
        long seconds = Duration.between(Instant.now(), session.getQuestionEndsAt()).getSeconds();
        return (int) Math.max(seconds, 0);
    }

    private void bumpRevision(QuizSession session) {
        long revision = session.getRevision() == null ? 0 : session.getRevision();
        session.setRevision(revision + 1);
        quizSessionRepository.save(session);
    }

    private User requireStudent(String studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole() != Role.STUDENT) {
            throw new org.springframework.security.access.AccessDeniedException("Student access required");
        }
        return user;
    }

    private User resolveUserByLoginIdentity(String loginIdentity) {
        return userRepository.findByEmail(loginIdentity)
                .or(() -> {
                    List<User> phoneUsers = userRepository.findByPhone(loginIdentity);
                    return phoneUsers.isEmpty() ? Optional.empty() : Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private boolean answersMatch(String studentAnswer, String correctAnswer) {
        if (studentAnswer == null || correctAnswer == null) {
            return false;
        }
        return normalizeAnswer(studentAnswer).equals(normalizeAnswer(correctAnswer));
    }

    private String normalizeAnswer(String answer) {
        if (answer == null) {
            return "";
        }
        return Normalizer.normalize(answer, Normalizer.Form.NFKC)
                .toLowerCase()
                .trim()
                .replaceAll("[\\p{Punct}\\p{S}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private List<String> parseMultiAnswer(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private boolean multiAnswersMatch(List<String> studentAnswers, List<String> correctAnswers) {
        if (studentAnswers == null || correctAnswers == null) {
            return false;
        }
        Set<String> normalizedStudent = studentAnswers.stream()
                .map(this::normalizeAnswer)
                .collect(Collectors.toSet());
        Set<String> normalizedCorrect = correctAnswers.stream()
                .map(this::normalizeAnswer)
                .collect(Collectors.toSet());
        return normalizedStudent.equals(normalizedCorrect);
    }

    /**
     * Grades a student answer against a question.
     * For MCQ/TF, handles both label-based ("B") and text-based correct answers.
     */
    private boolean gradeAnswer(Question question, String studentAnswer) {
        if (studentAnswer == null || studentAnswer.isBlank()) {
            return false;
        }

        String type = question.getType() == null ? "" : question.getType().toUpperCase();
        boolean isMcqOrTf = type.equals("MCQ") || type.equals("TRUE_FALSE") || type.equals("TF");

        if (!isMcqOrTf) {
            // Non-MCQ: direct text comparison
            return answersMatch(studentAnswer, question.getCorrectAnswer());
        }

        // Multi-select MCQ
        if (question.getCorrectAnswers() != null && !question.getCorrectAnswers().isEmpty()) {
            List<String> studentSelections = parseMultiAnswer(studentAnswer);
            // Map each selection to its label, then compare labels
            Set<String> studentLabels = studentSelections.stream()
                    .map(sel -> resolveOptionLabel(question, sel))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            Set<String> correctLabels = question.getCorrectAnswers().stream()
                    .map(ca -> resolveOptionLabel(question, ca))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            // Also compare raw normalized values as fallback
            Set<String> normalizedStudent = studentSelections.stream()
                    .map(this::normalizeAnswer)
                    .collect(Collectors.toSet());
            Set<String> normalizedCorrect = question.getCorrectAnswers().stream()
                    .map(this::normalizeAnswer)
                    .collect(Collectors.toSet());
            return studentLabels.equals(correctLabels) || normalizedStudent.equals(normalizedCorrect);
        }

        // Single-select MCQ/TF
        String correctAnswer = question.getCorrectAnswer();
        if (correctAnswer == null || correctAnswer.isBlank()) {
            return false;
        }

        // Direct text match
        if (answersMatch(studentAnswer, correctAnswer)) {
            return true;
        }

        // Label-based match: find which option the student picked, check its label
        String studentLabel = resolveOptionLabel(question, studentAnswer);
        String correctLabel = resolveOptionLabel(question, correctAnswer);

        if (studentLabel != null && correctLabel != null) {
            return answersMatch(studentLabel, correctLabel);
        }

        // If correctAnswer is a label, check if student's selected option has that label
        if (studentLabel != null) {
            return answersMatch(studentLabel, correctAnswer);
        }

        // If student sent a label, check if it matches the correct option's label
        if (correctLabel != null) {
            return answersMatch(studentAnswer, correctLabel);
        }

        return false;
    }

    /**
     * Given an option text or label, returns the label (A/B/C/D) for that option.
     * Returns null if not found.
     */
    private String resolveOptionLabel(Question question, String textOrLabel) {
        if (question.getOptions() == null || textOrLabel == null) {
            return null;
        }
        String[] labels = {"A", "B", "C", "D"};
        String normalized = normalizeAnswer(textOrLabel);
        for (int i = 0; i < question.getOptions().size(); i++) {
            String opt = question.getOptions().get(i);
            String label = i < labels.length ? labels[i] : String.valueOf(i + 1);
            // Match by option text
            if (normalizeAnswer(opt).equals(normalized)) {
                return label;
            }
            // Match by label directly
            if (normalizeAnswer(label).equals(normalized)) {
                return label;
            }
        }
        return null;
    }
}
