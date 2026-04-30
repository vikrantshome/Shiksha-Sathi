package com.shikshasathi.backend.api.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
public class ApiLoggingFilter extends OncePerRequestFilter {

    private static final Set<String> SENSITIVE_FIELDS = Set.of(
            "password", "token", "secret", "apiKey", "api_key",
            "authorization", "creditCard", "cardNumber", "cvv",
            "jwt", "refreshToken", "access_token"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Generate correlation ID for traceability
        String correlationId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("correlationId", correlationId);

        // Propagate correlation ID in response header for client-side tracing
        response.setHeader("X-Correlation-ID", correlationId);

        long startTime = System.currentTimeMillis();
        String requestBody = "";
        String responseBody = "";
        int status = 0;

        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        if (isJsonRequest(request) && (request.getMethod().equals("POST") || request.getMethod().equals("PUT") || request.getMethod().equals("PATCH"))) {
            requestBody = captureRequestBody(request);
        }

        try {
            filterChain.doFilter(request, responseWrapper);
            status = responseWrapper.getStatus();

            if (status >= 400) {
                responseBody = new String(responseWrapper.getContentAsByteArray(), StandardCharsets.UTF_8);
            }
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            String userInfo = getUserInfo(request);

            if (status >= 400) {
                log.error("API ERROR | {} {} | status: {} | duration: {}ms | user: {} | correlationId: {} | requestBody: {} | responseBody: {}",
                        request.getMethod(),
                        request.getRequestURI(),
                        status,
                        duration,
                        userInfo,
                        correlationId,
                        sanitize(requestBody, 1000),
                        sanitize(responseBody, 2000));
            } else {
                log.debug("API | {} {} | status: {} | duration: {}ms | user: {} | correlationId: {}",
                        request.getMethod(),
                        request.getRequestURI(),
                        status,
                        duration,
                        userInfo,
                        correlationId);
            }

            responseWrapper.copyBodyToResponse();
            MDC.clear();
        }
    }

    private boolean isJsonRequest(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.contains("application/json");
    }

    private String captureRequestBody(HttpServletRequest request) {
        try {
            return "body_captured";
        } catch (Exception e) {
            return "unable_to_capture";
        }
    }

    private String getUserInfo(HttpServletRequest request) {
        try {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                return auth.getName();
            }
            if (request.getUserPrincipal() != null) {
                return request.getUserPrincipal().getName();
            }
        } catch (Exception e) {
            // Ignore
        }
        return "anonymous";
    }

    /**
     * Truncates and sanitizes log content by masking sensitive fields.
     */
    private String sanitize(String str, int maxLength) {
        if (str == null) return "";
        String sanitized = str;
        for (String field : SENSITIVE_FIELDS) {
            sanitized = sanitized.replaceAll("(?i)(\"" + field + "\"\\s*:\\s*\")([^\"]*)(\")", "$1***MASKED***$3");
        }
        if (sanitized.length() <= maxLength) return sanitized;
        return sanitized.substring(0, maxLength) + "...[truncated]";
    }
}
