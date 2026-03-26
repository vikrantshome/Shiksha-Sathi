package com.shikshasathi.backend.infrastructure.repository.org;

import com.shikshasathi.backend.core.domain.org.Organization;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends MongoRepository<Organization, String> {
}
