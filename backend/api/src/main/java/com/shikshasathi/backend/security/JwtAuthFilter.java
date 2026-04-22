package com.shikshasathi.backend.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            username = jwtUtil.extractUsername(jwt);
        } catch (ExpiredJwtException e) {
            log.debug("JWT expired at {}. Current time: {}", e.getClaims().getExpiration(), new java.util.Date());
            filterChain.doFilter(request, response);
            return;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid JWT token: {}", e.getMessage());
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Prefer the userId claim (unique) to avoid ambiguity when multiple users share a phone number.
            String userId = jwtUtil.extractUserId(jwt);
            UserDetails userDetails = null;

            if (userId != null && !userId.isBlank()) {
                User user = userRepository.findById(userId).orElse(null);
                if (user == null) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String identity = (user.getEmail() != null && !user.getEmail().isBlank())
                        ? user.getEmail()
                        : user.getPhone();

                boolean subjectMatchesUser = username.equals(identity)
                        || (user.getPhone() != null && username.equals(user.getPhone()))
                        || (user.getEmail() != null && username.equals(user.getEmail()));

                if (!subjectMatchesUser) {
                    filterChain.doFilter(request, response);
                    return;
                }

                userDetails = org.springframework.security.core.userdetails.User.builder()
                        .username(user.getId())
                        .password(user.getPasswordHash())
                        .roles(user.getRole().name())
                        .build();
            } else {
                userDetails = this.userDetailsService.loadUserByUsername(username);
            }

            // Validate against the token subject (username extracted from JWT).
            // Some users may have both phone + email, and our UserDetails username can differ
            // from the login identity used to mint the token.
            if (jwtUtil.isTokenValid(jwt, username)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
