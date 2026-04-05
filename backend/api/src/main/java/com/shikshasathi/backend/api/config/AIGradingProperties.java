package com.shikshasathi.backend.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for the AI grading service.
 * Allows enabling/disabling AI grading, setting the endpoint URL,
 * timeout, and fallback behavior.
 */
@Configuration
@ConfigurationProperties(prefix = "ai-grading")
@Getter
@Setter
public class AIGradingProperties {

    /** Whether AI grading is enabled. When false, falls back to string matching. */
    private boolean enabled = true;

    /** URL of the HF Space grading endpoint. */
    private String endpointUrl = "https://huggingface.co/spaces/shiksha-sathi/shiksha-sathi-grading-agent";

    /** HTTP timeout in milliseconds for the grading request. */
    private long timeoutMs = 30000;

    /** Temperature for the AI model (lower = more deterministic). */
    private double temperature = 0.1;

    /** Whether to fall back to string matching when AI grading fails. */
    private boolean fallbackToStringMatch = true;
}
