package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.QuizAttempt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizAttemptRepository extends MongoRepository<QuizAttempt, String> {
    List<QuizAttempt> findByQuizIdAndStudentId(String quizId, String studentId);
    List<QuizAttempt> findByStudentId(String studentId);
}

