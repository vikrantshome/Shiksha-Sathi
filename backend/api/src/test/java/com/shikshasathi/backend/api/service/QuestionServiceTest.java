package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;
    
    @Mock
    private MongoTemplate mongoTemplate;

    @InjectMocks
    private QuestionService questionService;

    @Test
    void createQuestion_SavesSuccessfully() {
        Question q = new Question();
        q.setId("q123");
        q.setText("What is Java?");
        q.setType("MCQ");

        when(questionRepository.save(any(Question.class))).thenReturn(q);

        Question result = questionService.createQuestion(q);
        
        assertEquals("q123", result.getId());
        assertEquals("What is Java?", result.getText());
        verify(questionRepository, times(1)).save(q);
    }

    @Test
    void createQuestion_DefaultsPointsWhenMissing() {
        Question q = new Question();
        q.setText("Explain algebra.");
        q.setType("SHORT_ANSWER");

        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question result = questionService.createQuestion(q);

        ArgumentCaptor<Question> captor = ArgumentCaptor.forClass(Question.class);
        verify(questionRepository).save(captor.capture());
        assertEquals(2, captor.getValue().getPoints());
        assertEquals(2, result.getPoints());
    }

    @Test
    void createQuestion_PreservesExplicitPoints() {
        Question q = new Question();
        q.setText("Custom score question");
        q.setType("MCQ");
        q.setPoints(4);

        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question result = questionService.createQuestion(q);

        ArgumentCaptor<Question> captor = ArgumentCaptor.forClass(Question.class);
        verify(questionRepository).save(captor.capture());
        assertEquals(4, captor.getValue().getPoints());
        assertEquals(4, result.getPoints());
    }

    @Test
    void getDistinctSubjects_FiltersByBoardAndClass() {
        when(mongoTemplate.findDistinct(any(Query.class), eq("subject_id"), eq(Question.class), eq(String.class)))
                .thenReturn(List.of("Science"));

        List<String> result = questionService.getDistinctSubjects("NCERT", "7");

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).findDistinct(queryCaptor.capture(), eq("subject_id"), eq(Question.class), eq(String.class));

        Query capturedQuery = queryCaptor.getValue();
        assertEquals("NCERT", capturedQuery.getQueryObject().get("provenance.board"));
        assertEquals("7", capturedQuery.getQueryObject().get("provenance.class"));
        assertEquals(List.of("Science"), result);
    }

    @Test
    void getDistinctChapters_SortsChaptersInNaturalOrder() {
        when(mongoTemplate.findDistinct(any(Query.class), eq("chapter"), eq(Question.class), eq(String.class)))
                .thenReturn(List.of(
                        "Chapter 11: Constructions",
                        "Chapter 2: Polynomials",
                        "Chapter 9: Areas of Parallelograms and Triangles",
                        "Chapter 1: Number Systems"
                ));

        List<String> result = questionService.getDistinctChapters("Mathematics", null, "9");

        assertEquals(List.of(
                "Chapter 1: Number Systems",
                "Chapter 2: Polynomials",
                "Chapter 9: Areas of Parallelograms and Triangles",
                "Chapter 11: Constructions"
        ), result);
    }
}
