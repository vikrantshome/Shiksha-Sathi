package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class DerivedQuestionService {

    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private MongoTemplate mongoTemplate;

    /**
     * Generate derived practice questions for an entire chapter.
     * In production, this would call an LLM API to process the batch.
     * For now, generates template-based variations to establish the pipeline.
     */
    public List<Question> generateChapterBatch(String board, String classLevel, String subjectId, String book, String chapter, int questionsPerChapter) {
        Query query = new Query();
        query.addCriteria(Criteria.where("provenance.board").is(board));
        query.addCriteria(Criteria.where("provenance.class").is(classLevel));
        query.addCriteria(Criteria.where("subject_id").is(subjectId));
        query.addCriteria(Criteria.where("provenance.book").is(book));
        query.addCriteria(Criteria.where("chapter").is(chapter));
        query.addCriteria(Criteria.where("source_kind").is("CANONICAL"));
        
        List<Question> canonicalQuestions = mongoTemplate.find(query, Question.class);
        
        if (canonicalQuestions.isEmpty()) {
            throw new IllegalArgumentException("No canonical questions found for this chapter");
        }

        String generationRunId = UUID.randomUUID().toString().substring(0, 8);
        List<Question> derivedQuestions = new ArrayList<>();
        
        // Generate a derived question for the first few canonical questions
        int count = Math.min(questionsPerChapter, canonicalQuestions.size());
        
        for (int i = 0; i < count; i++) {
            Question canonical = canonicalQuestions.get(i);
            
            // Create a derived question
            Question derived = new Question();
            derived.setSourceKind("DERIVED");
            derived.setReviewStatus("DRAFT");
            derived.setDerivedFromChapterId(chapter);
            derived.setGenerationRunId(generationRunId);
            derived.setSourceCanonicalQuestionIds(List.of(canonical.getId()));
            derived.setGenerationRationale("Template-based generation for v1 pilot");
            
            derived.setSubjectId(canonical.getSubjectId());
            derived.setChapter(canonical.getChapter());
            derived.setTopic(canonical.getTopic());
            derived.setProvenance(canonical.getProvenance());
            derived.setPoints(canonical.getPoints());
            
            // Modify text slightly to simulate generation
            derived.setText("Consider the following: " + canonical.getText() + " How would you apply this concept?");
            derived.setType("SHORT_ANSWER"); // Force to short answer for distinction
            derived.setCorrectAnswer("This is a derived conceptual answer based on: " + canonical.getCorrectAnswer());
            derived.setExplanation("Derived explanation linking back to canonical concept.");
            
            derivedQuestions.add(derived);
        }
        
        return questionRepository.saveAll(derivedQuestions);
    }

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
