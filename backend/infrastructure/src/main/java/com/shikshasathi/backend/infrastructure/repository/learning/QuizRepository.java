package com.shikshasathi.backend.infrastructure.repository.learning;

import com.shikshasathi.backend.core.domain.learning.Quiz;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends MongoRepository<Quiz, String> {
    List<Quiz> findByTeacherId(String teacherId);
    Optional<Quiz> findBySelfPacedCode(String selfPacedCode);
    boolean existsBySelfPacedCode(String selfPacedCode);
}

