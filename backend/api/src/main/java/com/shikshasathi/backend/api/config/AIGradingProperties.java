package com.shikshasathi.backend.api.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for the AI grading service.
 * Supports both NVIDIA API (primary) and HF Space (fallback).
 */
@Configuration
@ConfigurationProperties(prefix = "ai-grading")
@Getter
@Setter
public class AIGradingProperties {

    /** Whether AI grading is enabled. When false, falls back to string matching. */
    private boolean enabled = true;

    /** API provider: "nvidia" or "hf-space". */
    private String provider = "nvidia";

    /** API key for the provider (NVIDIA API key or HF token). */
    private String apiKey;

    /** Model name to use (e.g., "nvidia/nemotron-3-super-120b-a12b"). */
    private String model = "nvidia/nemotron-3-super-120b-a12b";

    /** URL of the primary API endpoint (NVIDIA API). */
    private String endpointUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    /** URL of the first fallback model (qwen3.5-122b) when primary fails or returns empty reasoning. */
    private String fallbackUrl1 = "https://build.nvidia.com/qwen/qwen3.5-122b-a10b";

    /** URL of the second fallback model (mistral-small-4-119b) when primary and first fallback fail. */
    private String fallbackUrl2 = "https://build.nvidia.com/mistralai/mistral-small-4-119b-2603";

    /** HTTP timeout in milliseconds for the grading request. */
    private long timeoutMs = 30000;

    public long getTimeoutMs() {
        return timeoutMs;
    }

    /** Temperature for the AI model (lower = more deterministic). */
    private double temperature = 0.1;

    /** Whether to fall back to string matching when AI grading fails. Default false. */
    private boolean fallbackToStringMatch = false;

    public boolean isEnabled() {
        return enabled;
    }

public boolean isFallbackToStringMatch() {
    return fallbackToStringMatch;
}

public String getHfSpaceUrl() {
    return endpointUrl;
}
}
