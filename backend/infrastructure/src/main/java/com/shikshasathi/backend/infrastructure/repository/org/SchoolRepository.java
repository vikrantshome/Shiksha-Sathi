package com.shikshasathi.backend.infrastructure.repository.org;

import com.shikshasathi.backend.core.domain.org.School;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolRepository extends MongoRepository<School, String> {
    List<School> findByOrganizationId(String organizationId);
}
