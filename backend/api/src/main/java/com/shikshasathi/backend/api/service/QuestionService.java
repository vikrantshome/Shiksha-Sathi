package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final MongoTemplate mongoTemplate;

    public List<String> getDistinctSubjects() {
        return mongoTemplate.getCollection("questions")
                .distinct("subject_id", String.class)
                .into(new ArrayList<>());
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
        if (classLevel != null && !classLevel.isEmpty()) query.addCriteria(Criteria.where("provenance.class").is(classLevel));
        if (subject != null && !subject.isEmpty()) query.addCriteria(Criteria.where("subject_id").is(subject));

        return mongoTemplate.findDistinct(query, "provenance.book", Question.class, String.class);
    }

    public List<String> getDistinctChapters(String subjectId, String book, String classLevel) {
        Query query = new Query();
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("subject_id").is(subjectId));
        }
        if (book != null && !book.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.book").is(book));
        }
        if (classLevel != null && !classLevel.isEmpty()) {
            query.addCriteria(Criteria.where("provenance.class").is(classLevel));
        }

        return mongoTemplate.findDistinct(query, "chapter", Question.class, String.class);
    }

    public List<Question> searchQuestions(String board, String classLevel, String subjectId, String book, String chapter, String queryText, String type, Boolean approvedOnly, Boolean visibleOnly) {
        Query query = new Query();

        if (board != null && !board.isEmpty()) query.addCriteria(Criteria.where("provenance.board").is(board));
        if (classLevel != null && !classLevel.isEmpty()) query.addCriteria(Criteria.where("provenance.class").is(classLevel));
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("subject_id").is(subjectId));
        }
        if (book != null && !book.isEmpty()) query.addCriteria(Criteria.where("provenance.book").is(book));
        if (chapter != null && !chapter.isEmpty() && !chapter.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("chapter").is(chapter));
        }

        // visibleOnly takes precedence - only PUBLISHED content
        if (visibleOnly != null && visibleOnly) {
            query.addCriteria(Criteria.where("review_status").is("PUBLISHED"));
        } else if (approvedOnly != null && approvedOnly) {
            // approvedOnly for admin/reviewer workflows - APPROVED or PUBLISHED
            query.addCriteria(Criteria.where("review_status").in("APPROVED", "PUBLISHED"));
        }

        if (type != null && !type.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("type").is(type));
        }

        if (queryText != null && !queryText.isEmpty()) {
            Criteria textCriteria = new Criteria().orOperator(
                Criteria.where("text").regex(queryText, "i"),
                Criteria.where("topic").regex(queryText, "i"),
                Criteria.where("provenance.chapter_title").regex(queryText, "i")
            );
            query.addCriteria(textCriteria);
        }

        return mongoTemplate.find(query, Question.class);
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
}
