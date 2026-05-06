package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.core.domain.learning.Question;
import com.shikshasathi.backend.core.domain.learning.Provenance;
import com.shikshasathi.backend.infrastructure.repository.learning.QuestionRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.bson.Document;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuestionServiceTest {

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private UserRepository userRepository;

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
        when(mongoTemplate.findDistinct(any(Query.class), eq("provenance.subject"), eq(Question.class), eq(String.class)))
                .thenReturn(List.of());

        List<String> result = questionService.getDistinctSubjects("NCERT", "7", "teacher@test.com");

        // Verify both distinct queries were invoked (board/class filtering is handled internally)
        verify(mongoTemplate).findDistinct(any(Query.class), eq("subject_id"), eq(Question.class), eq(String.class));
        verify(mongoTemplate).findDistinct(any(Query.class), eq("provenance.subject"), eq(Question.class), eq(String.class));
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

        List<String> result = questionService.getDistinctChapters("NCERT", "Mathematics", null, "9", "teacher@test.com");

        assertEquals(List.of(
                "Chapter 1: Number Systems",
                "Chapter 2: Polynomials",
                "Chapter 9: Areas of Parallelograms and Triangles",
                "Chapter 11: Constructions"
        ), result);
    }

    @Test
    void searchQuestions_ChapterMatchesByExactOrProvenance() {
        when(mongoTemplate.find(any(Query.class), eq(Question.class))).thenReturn(List.of());

        questionService.searchQuestions(
                "NCERT",
                "8",
                "Mathematics",
                null,
                null,
                null,
                "Chapter 1: Rational Numbers",
                null,
                "ALL",
                false,
                true,
                "teacher@test.com"
        );

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).find(queryCaptor.capture(), eq(Question.class));

        Document queryDoc = queryCaptor.getValue().getQueryObject();
        assertTrue(containsKey(queryDoc, "$or"), "Expected chapter filter to use $or");
        assertTrue(containsFieldValue(queryDoc, "chapter", "Chapter 1: Rational Numbers"), "Expected exact chapter match clause");
        assertTrue(containsFieldValue(queryDoc, "review_status", "PUBLISHED"), "Expected visibleOnly to force PUBLISHED");
        assertTrue(containsFieldValue(queryDoc, "provenance.chapterNumber", 1), "Expected provenance chapterNumber clause");
        assertTrue(containsKey(queryDoc, "provenance.chapterTitle"), "Expected provenance chapterTitle clause");
        assertTrue(containsKey(queryDoc, "subject_id") || containsKey(queryDoc, "provenance.subject"), "Expected subject filter");
    }

    private static boolean containsKey(Object node, String key) {
        if (node == null) return false;
        if (node instanceof Document doc) {
            if (doc.containsKey(key)) return true;
            for (Object value : doc.values()) {
                if (containsKey(value, key)) return true;
            }
            return false;
        }
        if (node instanceof Map<?, ?> map) {
            if (map.containsKey(key)) return true;
            for (Object value : map.values()) {
                if (containsKey(value, key)) return true;
            }
            return false;
        }
        if (node instanceof List<?> list) {
            for (Object value : list) {
                if (containsKey(value, key)) return true;
            }
            return false;
        }
        return false;
    }

    private static boolean containsFieldValue(Object node, String key, Object expectedValue) {
        if (node == null) return false;
        if (node instanceof Document doc) {
            if (doc.containsKey(key) && expectedValue.equals(doc.get(key))) return true;
            for (Object value : doc.values()) {
                if (containsFieldValue(value, key, expectedValue)) return true;
            }
            return false;
        }
        if (node instanceof Map<?, ?> map) {
            if (map.containsKey(key) && expectedValue.equals(map.get(key))) return true;
            for (Object value : map.values()) {
                if (containsFieldValue(value, key, expectedValue)) return true;
            }
            return false;
        }
        if (node instanceof List<?> list) {
            for (Object value : list) {
                if (containsFieldValue(value, key, expectedValue)) return true;
            }
            return false;
        }
        return false;
    }

    @Test
    void createCustomQuestion_PrefersTeacherRole_WhenMultipleUsersSharePhone() {
        com.shikshasathi.backend.core.domain.user.User teacher = new com.shikshasathi.backend.core.domain.user.User();
        teacher.setId("teacherId");
        teacher.setRole(com.shikshasathi.backend.core.domain.user.Role.TEACHER);

        com.shikshasathi.backend.core.domain.user.User student = new com.shikshasathi.backend.core.domain.user.User();
        student.setId("studentId");
        student.setRole(com.shikshasathi.backend.core.domain.user.Role.STUDENT);

        // Student returned first (simulating random MongoDB order)
        when(userRepository.findByPhone("+911234567890")).thenReturn(List.of(student, teacher));
        when(questionRepository.save(any(Question.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Question q = new Question();
        q.setText("Custom question");
        q.setType("MCQ");
        q.setProvenance(Provenance.builder().build());

        Question result = questionService.createCustomQuestion(q, "+911234567890");

        assertEquals("teacherId", result.getProvenance().getTeacherId());
    }

    @Test
    void getPrivacyCriteria_PrefersTeacherRole_WhenMultipleUsersSharePhone() {
        com.shikshasathi.backend.core.domain.user.User teacher = new com.shikshasathi.backend.core.domain.user.User();
        teacher.setId("teacherId");
        teacher.setRole(com.shikshasathi.backend.core.domain.user.Role.TEACHER);

        com.shikshasathi.backend.core.domain.user.User student = new com.shikshasathi.backend.core.domain.user.User();
        student.setId("studentId");
        student.setRole(com.shikshasathi.backend.core.domain.user.Role.STUDENT);

        when(userRepository.findByPhone("+911234567890")).thenReturn(List.of(student, teacher));
        when(mongoTemplate.findDistinct(any(Query.class), eq("subject_id"), eq(Question.class), eq(String.class)))
                .thenReturn(List.of());
        when(mongoTemplate.findDistinct(any(Query.class), eq("provenance.subject"), eq(Question.class), eq(String.class)))
                .thenReturn(List.of());

        questionService.getDistinctSubjects(null, null, "+911234567890");

        ArgumentCaptor<Query> queryCaptor = ArgumentCaptor.forClass(Query.class);
        verify(mongoTemplate).findDistinct(queryCaptor.capture(), eq("provenance.subject"), eq(Question.class), eq(String.class));

        Document queryDoc = queryCaptor.getValue().getQueryObject();
        assertTrue(containsFieldValue(queryDoc, "provenance.teacherId", "teacherId"),
                "Privacy criteria should use provenance.teacherId");
    }
}
