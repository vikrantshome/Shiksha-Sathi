package com.shikshasathi.backend.api.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Cache configuration for AI grading responses.
 * Uses Caffeine for high-performance in-memory caching with TTL.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Cache for AI grading responses.
     * TTL: 24 hours — same answer shouldn't be re-graded.
     * Max size: 10,000 entries — prevents unbounded memory growth.
     */
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("grading");
        manager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(24, TimeUnit.HOURS)
                .maximumSize(10_000)
                .recordStats());
        return manager;
    }
}
