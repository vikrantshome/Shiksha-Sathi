package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
        
        when(questionRepository.save(any(Question.class))).thenReturn(q);
        
        Question result = questionService.createQuestion(q);
        
        assertEquals("q123", result.getId());
        assertEquals("What is Java?", result.getText());
        verify(questionRepository, times(1)).save(q);
    }
}
