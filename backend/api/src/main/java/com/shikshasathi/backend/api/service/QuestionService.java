package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.ChapterMetaDTO;
import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.Data;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.aggregation.Fields;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private static final Pattern CHAPTER_NUMBER_PATTERN = Pattern.compile("(?i)chapter\\s*(\\d+)");
    private static final Pattern CHAPTER_NUMBER_AND_TITLE_PATTERN =
            Pattern.compile("(?i)^chapter\\s*(\\d+)\\s*:\\s*(.+?)\\s*$");
    private static final Pattern PLACEHOLDER_QUESTION_TEXT_PATTERN =
            Pattern.compile("(?i)^sample\\s+question\\s+\\d+\\b");

    private final QuestionRepository questionRepository;
    private final MongoTemplate mongoTemplate;

    /**
     * Fetch a single question by its MongoDB ID.
     */
    public Question getQuestionById(String id) {
        return questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found"));
    }

    private static final int DEFAULT_OBJECTIVE_POINTS = 1;
    private static final int DEFAULT_SHORT_ANSWER_POINTS = 2;
    private static final int DEFAULT_LONG_ANSWER_POINTS = 5;

    public List<String> getDistinctSubjects(String board, String classLevel) {
        Query query = new Query();
        if (board != null && !board.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.board").is(board));
        }
        if (classLevel != null && !classLevel.isEmpty()) {
            query.addCriteria(classLevelCriteria(classLevel));
        }
        List<String> subjectIds = mongoTemplate.findDistinct(query, "subject_id", Question.class, String.class);
        List<String> provenanceSubjects = mongoTemplate.findDistinct(query, "provenance.subject", Question.class, String.class);

        List<String> merged = new ArrayList<>();
        if (subjectIds != null) merged.addAll(subjectIds);
        if (provenanceSubjects != null) merged.addAll(provenanceSubjects);

        return merged.stream()
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    public List<String> getDistinctBoards() {
        return mongoTemplate.getCollection("questions")
                .distinct("provenance.board", String.class)
                .into(new ArrayList<>());
    }

    public List<String> getDistinctClasses(String board) {
        Query query = new Query();
        if (board != null && !board.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.board").is(board));
        }
        return mongoTemplate.findDistinct(query, "provenance.class", Question.class, String.class);
    }

    public List<String> getDistinctBooks(String board, String classLevel, String subject) {
        Query query = new Query();
        if (board != null && !board.isEmpty()) query.addCriteria(Criteria.where("provenance.board").is(board));
        if (classLevel != null && !classLevel.isEmpty()) query.addCriteria(classLevelCriteria(classLevel));
        if (subject != null && !subject.isEmpty()) query.addCriteria(subjectCriteria(subject));

        return mongoTemplate.findDistinct(query, "provenance.book", Question.class, String.class);
    }

    public List<String> getDistinctChapters(String board, String subjectId, String book, String classLevel) {
        Query query = new Query();
        if (board != null && !board.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.board").is(board));
        }
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            query.addCriteria(subjectCriteria(subjectId));
        }
        if (book != null && !book.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.book").is(book));
        }
        if (classLevel != null && !classLevel.isEmpty()) {
            query.addCriteria(classLevelCriteria(classLevel));
        }

        List<String> chapters = new ArrayList<>(
                mongoTemplate.findDistinct(query, "chapter", Question.class, String.class)
        );
        chapters.sort(chapterTitleComparator());
        return chapters;
    }

    public List<ChapterMetaDTO> getChapterMeta(String board, String classLevel, String subjectId, String book, Boolean visibleOnly) {
        List<Criteria> criteria = new ArrayList<>();
        if (board != null && !board.isEmpty()) criteria.add(Criteria.where("provenance.board").is(board));
        if (classLevel != null && !classLevel.isEmpty()) criteria.add(classLevelCriteria(classLevel));
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            criteria.add(subjectCriteria(subjectId));
        }
        if (book != null && !book.isEmpty()) criteria.add(Criteria.where("provenance.book").is(book));
        if (visibleOnly != null && visibleOnly) {
            criteria.add(Criteria.where("review_status").is("PUBLISHED"));
            criteria.add(excludePlaceholderQuestionsCriteria());
        }

        Criteria matchCriteria = criteria.isEmpty()
                ? new Criteria()
                : new Criteria().andOperator(criteria.toArray(new Criteria[0]));

        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(matchCriteria),
                Aggregation.group(Fields.from(
                                Fields.field("chapterNumber", "provenance.chapterNumber"),
                                Fields.field("chapterTitle", "provenance.chapterTitle")
                        ))
                        .count().as("count"),
                Aggregation.project("count")
                        .and("_id.chapterNumber").as("chapterNumber")
                        .and("_id.chapterTitle").as("chapterTitle"),
                Aggregation.sort(org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Order.asc("chapterNumber"),
                        org.springframework.data.domain.Sort.Order.asc("chapterTitle")
                ))
        );

        AggregationResults<ChapterMetaRow> results =
                mongoTemplate.aggregate(aggregation, "questions", ChapterMetaRow.class);

        List<ChapterMetaDTO> out = new ArrayList<>();
        for (ChapterMetaRow row : results.getMappedResults()) {
            if (row.getChapterNumber() == null) continue;
            String title = row.getChapterTitle();
            String label = title == null || title.isBlank()
                    ? "Chapter " + row.getChapterNumber()
                    : "Chapter " + row.getChapterNumber() + ": " + title;
            out.add(ChapterMetaDTO.builder()
                    .chapterNumber(row.getChapterNumber())
                    .chapterTitle(title)
                    .label(label)
                    .count(row.getCount())
                    .build());
        }
        return out;
    }

    @Data
    private static class ChapterMetaRow {
        private Integer chapterNumber;
        private String chapterTitle;
        private long count;
    }

    public List<Question> searchQuestions(String board, String classLevel, String subjectId, String book, Integer chapterNumber, String chapterTitle, String chapter, String queryText, String type, Boolean approvedOnly, Boolean visibleOnly) {
        Query query = new Query();
        List<Criteria> criteria = new ArrayList<>();

        if (board != null && !board.isEmpty()) criteria.add(Criteria.where("provenance.board").is(board));
        if (classLevel != null && !classLevel.isEmpty()) criteria.add(classLevelCriteria(classLevel));
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            criteria.add(subjectCriteria(subjectId));
        }
        if (book != null && !book.isEmpty()) criteria.add(Criteria.where("provenance.book").is(book));
        if (chapterNumber != null) {
            criteria.add(Criteria.where("provenance.chapterNumber").is(chapterNumber));
            if (chapterTitle != null && !chapterTitle.isBlank()) {
                criteria.add(Criteria.where("provenance.chapterTitle")
                        .regex("^" + Pattern.quote(chapterTitle.trim()) + "$", "i"));
            }
        } else if (chapter != null && !chapter.isEmpty() && !chapter.equalsIgnoreCase("null")) {
            Criteria chapterExact = Criteria.where("chapter").is(chapter);

            Matcher chapterMatcher = CHAPTER_NUMBER_AND_TITLE_PATTERN.matcher(chapter);
            if (chapterMatcher.matches()) {
                int parsedChapterNumber = Integer.parseInt(chapterMatcher.group(1));
                String parsedChapterTitle = chapterMatcher.group(2).trim();

                Criteria byProvenance = new Criteria().andOperator(
                        Criteria.where("provenance.chapterNumber").is(parsedChapterNumber),
                        Criteria.where("provenance.chapterTitle").regex("^" + Pattern.quote(parsedChapterTitle) + "$", "i")
                );

                criteria.add(new Criteria().orOperator(chapterExact, byProvenance));
            } else {
                criteria.add(chapterExact);
            }
        }

        // visibleOnly takes precedence - only PUBLISHED content
        if (visibleOnly != null && visibleOnly) {
            criteria.add(Criteria.where("review_status").is("PUBLISHED"));
            criteria.add(excludePlaceholderQuestionsCriteria());
        } else if (approvedOnly != null && approvedOnly) {
            // approvedOnly for admin/reviewer workflows - APPROVED or PUBLISHED
            criteria.add(Criteria.where("review_status").in("APPROVED", "PUBLISHED"));
        }

        if (type != null && !type.equalsIgnoreCase("ALL")) {
            criteria.add(Criteria.where("type").is(type));
        }

        if (queryText != null && !queryText.isEmpty()) {
            Criteria textCriteria = new Criteria().orOperator(
                    Criteria.where("text").regex(queryText, "i"),
                    Criteria.where("topic").regex(queryText, "i"),
                    Criteria.where("provenance.chapterTitle").regex(queryText, "i")
            );
            criteria.add(textCriteria);
        }

        if (!criteria.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(criteria.toArray(new Criteria[0])));
        }

        return mongoTemplate.find(query, Question.class);
    }

    /**
     * Some ingested datasets include placeholder "Sample question N ..." rows. These should never be shown
     * in curated browsing flows (visibleOnly=true).
     */
    private Criteria excludePlaceholderQuestionsCriteria() {
        return Criteria.where("text").not().regex(PLACEHOLDER_QUESTION_TEXT_PATTERN);
    }

    /**
     * MongoDB data historically contains mixed types for provenance.class (e.g., "8" or 8).
     * Match both representations to avoid dropping results.
     */
    private Criteria classLevelCriteria(String classLevel) {
        try {
            int numeric = Integer.parseInt(classLevel);
            return Criteria.where("provenance.class").in(classLevel, numeric);
        } catch (NumberFormatException e) {
            return Criteria.where("provenance.class").is(classLevel);
        }
    }

    /**
     * MongoDB data historically contains inconsistent subject storage:
     * some records use `subject_id`, others only populate `provenance.subject`.
     */
    private Criteria subjectCriteria(String subjectId) {
        return new Criteria().orOperator(
                Criteria.where("subject_id").is(subjectId),
                Criteria.where("provenance.subject").is(subjectId)
        );
    }

    public Question createQuestion(Question question) {
        if (question.getPoints() == null || question.getPoints() <= 0) {
            question.setPoints(defaultPointsForType(question.getType()));
        }
        return questionRepository.save(question);
    }

    private int defaultPointsForType(String type) {
        if (type == null || type.isBlank()) {
            return DEFAULT_OBJECTIVE_POINTS;
        }

        return switch (type) {
            case "SHORT_ANSWER" -> DEFAULT_SHORT_ANSWER_POINTS;
            case "LONG_ANSWER", "ESSAY" -> DEFAULT_LONG_ANSWER_POINTS;
            default -> DEFAULT_OBJECTIVE_POINTS;
        };
    }

    private Comparator<String> chapterTitleComparator() {
        return Comparator
                .comparingInt(this::extractChapterNumber)
                .thenComparing(title -> title == null ? "" : title, String.CASE_INSENSITIVE_ORDER);
    }

    private int extractChapterNumber(String chapterTitle) {
        if (chapterTitle == null || chapterTitle.isBlank()) {
            return Integer.MAX_VALUE;
        }

        Matcher matcher = CHAPTER_NUMBER_PATTERN.matcher(chapterTitle);
        if (matcher.find()) {
            return Integer.parseInt(matcher.group(1));
        }

        return Integer.MAX_VALUE;
    }
}
