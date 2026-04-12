package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.QuizSession;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSessionRepository extends MongoRepository<QuizSession, String> {
    Optional<QuizSession> findBySessionCode(String sessionCode);
    boolean existsBySessionCode(String sessionCode);
    List<QuizSession> findByQuizId(String quizId);
    List<QuizSession> findByTeacherId(String teacherId);
}

