package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.auth.AuthRequest;
import com.shikshasathi.backend.api.dto.auth.AuthResponse;
import com.shikshasathi.backend.api.dto.auth.SignupRequest;
import com.shikshasathi.backend.api.dto.auth.UserResponse;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import com.shikshasathi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse authenticate(AuthRequest request) {
        String loginIdentity = request.getEmail() != null ? request.getEmail() : request.getPhone();
        User user = (request.getEmail() != null ? userRepository.findByEmail(request.getEmail()) : userRepository.findByPhone(request.getPhone()))
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        if (!user.isActive()) {
            throw new RuntimeException("User account is disabled");
        }

        user.setLastLoginAt(Instant.now().toEpochMilli());
        userRepository.save(user);

        String token = jwtUtil.generateToken(loginIdentity, user.getRole().name(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(), user.getRole());
    }

    public AuthResponse register(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setActive(true);
        user.setCreatedAt(Instant.now());

        user = userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(), user.getRole());
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );
    }
}
