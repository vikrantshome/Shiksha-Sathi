package com.shikshasathi.backend.infrastructure.repository.teacher;

import com.shikshasathi.backend.core.domain.teacher.Profile;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface ProfileRepository extends MongoRepository<Profile, String> {
    Optional<Profile> findByUserId(String userId);
}
