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
}
