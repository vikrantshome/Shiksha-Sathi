package com.shikshasathi.backend.core.domain.tracking;

import com.shikshasathi.backend.core.domain.BaseEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "analytics_events")
public class AnalyticsEvent extends BaseEntity {

    private String event;
    
    @Field("payload")
    private Map<String, Object> payload;
    
    private String userAgent;
    private String userId;
    private LocalDateTime timestamp;
}
