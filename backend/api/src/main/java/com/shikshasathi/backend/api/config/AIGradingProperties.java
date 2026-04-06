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
    private String apiKey = "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";

    /** Model name to use (e.g., "qwen/qwen3.5-397b-a17b"). */
    private String model = "qwen/qwen3.5-397b-a17b";

    /** URL of the primary API endpoint (NVIDIA API). */
    private String endpointUrl = "https://integrate.api.nvidia.com/v1/chat/completions";

    /** URL of the HF Space grading endpoint (fallback). */
    private String hfSpaceUrl = "https://ainaviksha-naviksha-ai-agent.hf.space/grade";

    /** HTTP timeout in milliseconds for the grading request. */
    private long timeoutMs = 30000;

    /** Temperature for the AI model (lower = more deterministic). */
    private double temperature = 0.1;

    /** Whether to fall back to string matching when AI grading fails. Default false — string matching gives incorrect results for subjective questions. */
    private boolean fallbackToStringMatch = false;
}
