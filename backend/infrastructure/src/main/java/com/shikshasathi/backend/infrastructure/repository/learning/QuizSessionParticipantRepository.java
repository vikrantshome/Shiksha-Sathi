package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.QuizSessionParticipant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizSessionParticipantRepository extends MongoRepository<QuizSessionParticipant, String> {
    Optional<QuizSessionParticipant> findBySessionIdAndStudentId(String sessionId, String studentId);
    List<QuizSessionParticipant> findBySessionId(String sessionId);
}

