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

    public List<String> getDistinctChapters(String subjectId) {
        Query query = new Query();
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("subject_id").is(subjectId));
        }
        
        return mongoTemplate.findDistinct(query, "chapter", Question.class, String.class);
    }

    public List<Question> searchQuestions(String subjectId, String chapter, String queryText, String type) {
        Query query = new Query();
        
        if (subjectId != null && !subjectId.isEmpty() && !subjectId.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("subject_id").is(subjectId));
        }
        
        if (chapter != null && !chapter.isEmpty() && !chapter.equalsIgnoreCase("null")) {
            query.addCriteria(Criteria.where("chapter").is(chapter));
        }
        
        if (type != null && !type.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("type").is(type));
        }
        
        if (queryText != null && !queryText.isEmpty()) {
            Criteria textCriteria = new Criteria().orOperator(
                Criteria.where("text").regex(queryText, "i"),
                Criteria.where("topic").regex(queryText, "i")
            );
            query.addCriteria(textCriteria);
        }
        
        return mongoTemplate.find(query, Question.class);
    }

    public Question createQuestion(Question question) {
        return questionRepository.save(question);
    }
}
