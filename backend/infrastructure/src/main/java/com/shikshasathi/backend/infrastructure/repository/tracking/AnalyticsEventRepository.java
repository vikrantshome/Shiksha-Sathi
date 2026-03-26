package com.shikshasathi.backend.infrastructure.repository.tracking;

import com.shikshasathi.backend.core.domain.tracking.AnalyticsEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AnalyticsEventRepository extends MongoRepository<AnalyticsEvent, String> {
}
