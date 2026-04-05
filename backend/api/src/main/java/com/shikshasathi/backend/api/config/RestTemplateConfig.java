package com.shikshasathi.backend.api.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration for HTTP client beans used by the AI grading service.
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, AIGradingProperties aiGradingProperties) {
        return builder
                .connectTimeout(Duration.ofMillis(aiGradingProperties.getTimeoutMs()))
                .readTimeout(Duration.ofMillis(aiGradingProperties.getTimeoutMs()))
                .build();
    }
}
