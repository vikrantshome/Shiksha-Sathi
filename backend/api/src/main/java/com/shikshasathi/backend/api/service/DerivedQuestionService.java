package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DerivedQuestionService {

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    public List<Question> getDerivedQuestions(String status, String chapter) {
        Query query = new Query();
        query.addCriteria(Criteria.where("source_kind").is("DERIVED"));
        
        if (status != null && !status.isEmpty()) {
            query.addCriteria(Criteria.where("review_status").is(status));
        }
        
        if (chapter != null && !chapter.isEmpty()) {
            query.addCriteria(Criteria.where("chapter").is(chapter));
        }
        
        return mongoTemplate.find(query, Question.class);
    }

    public Question approveQuestion(String id, String reviewerNotes) {
        Question q = questionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Question not found"));
        q.setReviewStatus("APPROVED");
        q.setReviewerNotes(reviewerNotes);
        return questionRepository.save(q);
    }

    public Question rejectQuestion(String id, String reviewerNotes) {
        Question q = questionRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Question not found"));
        q.setReviewStatus("REJECTED");
        q.setReviewerNotes(reviewerNotes);
        return questionRepository.save(q);
    }
    
    public int publishApprovedQuestions(String chapter) {
        Query query = new Query();
        query.addCriteria(Criteria.where("source_kind").is("DERIVED"));
        query.addCriteria(Criteria.where("review_status").is("APPROVED"));
        
        if (chapter != null && !chapter.isEmpty()) {
            query.addCriteria(Criteria.where("chapter").is(chapter));
        }
        
        List<Question> approved = mongoTemplate.find(query, Question.class);
        int count = 0;
        for (Question q : approved) {
            q.setReviewStatus("PUBLISHED");
            questionRepository.save(q);
            count++;
        }
        return count;
    }
}
