package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.QuizSessionAnswer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSessionAnswerRepository extends MongoRepository<QuizSessionAnswer, String> {
    Optional<QuizSessionAnswer> findBySessionIdAndStudentIdAndQuestionIndex(String sessionId, String studentId, Integer questionIndex);
    List<QuizSessionAnswer> findBySessionIdAndQuestionIndex(String sessionId, Integer questionIndex);
    List<QuizSessionAnswer> findBySessionId(String sessionId);
}

