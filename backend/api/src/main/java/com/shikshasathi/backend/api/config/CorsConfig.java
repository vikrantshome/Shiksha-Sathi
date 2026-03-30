package com.shikshasathi.backend.api.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:8080",
                    "https://shiksha-sathi-taupe.vercel.app",
                    "https://shiksha-sathi-vikrants-projects-9bdd0967.vercel.app",
                    "https://shiksha-sathi-git-main-vikrants-projects-9bdd0967.vercel.app"
                )
                .allowedOriginPatterns("https://*.vercel.app")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
