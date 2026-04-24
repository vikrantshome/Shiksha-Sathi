package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.auth.AuthRequest;
import com.shikshasathi.backend.api.dto.auth.AuthResponse;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import com.shikshasathi.backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void authenticate_SingleUserMatches_LogsInDirectly() {
        String phone = "9876543210";
        String password = "password123";
        AuthRequest request = new AuthRequest();
        request.setPhone(phone);
        request.setPassword(password);

        User user = new User();
        user.setId("user1");
        user.setPhone(phone);
        user.setPasswordHash("hash1");
        user.setActive(true);
        user.setRole(Role.STUDENT);
        user.setName("Student A");

        when(userRepository.findByPhone(phone)).thenReturn(List.of(user));
        when(passwordEncoder.matches(password, "hash1")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.authenticate(request);

        assertNotNull(response.getToken());
        assertEquals("user1", response.getUserId());
        assertNull(response.getCandidates());
        verify(userRepository).save(user);
    }

    @Test
    void authenticate_MultipleUsersSamePassword_ReturnsPickerWithAll() {
        String phone = "9876543210";
        String password = "password123";
        AuthRequest request = new AuthRequest();
        request.setPhone(phone);
        request.setPassword(password);

        User user1 = new User();
        user1.setId("user1");
        user1.setPasswordHash("hash1");
        user1.setActive(true);
        user1.setRole(Role.STUDENT);
        user1.setName("Student A");

        User user2 = new User();
        user2.setId("user2");
        user2.setPasswordHash("hash2");
        user2.setActive(true);
        user2.setRole(Role.TEACHER);
        user2.setName("Teacher B");

        when(userRepository.findByPhone(phone)).thenReturn(List.of(user1, user2));
        when(passwordEncoder.matches(password, "hash1")).thenReturn(true);
        when(passwordEncoder.matches(password, "hash2")).thenReturn(true);

        AuthResponse response = authService.authenticate(request);

        assertNull(response.getToken());
        assertNotNull(response.getCandidates());
        assertEquals(2, response.getCandidates().size());
    }

    @Test
    void authenticate_MultipleUsersDifferentPasswords_LogsInDirectlyIfOnlyOneMatches() {
        String phone = "9876543210";
        String password = "password123";
        AuthRequest request = new AuthRequest();
        request.setPhone(phone);
        request.setPassword(password);

        User user1 = new User();
        user1.setId("user1");
        user1.setPhone(phone);
        user1.setPasswordHash("hash1");
        user1.setActive(true);
        user1.setRole(Role.STUDENT);
        user1.setName("Student A");

        User user2 = new User();
        user2.setId("user2");
        user2.setPhone(phone);
        user2.setPasswordHash("hash2");
        user2.setActive(true);
        user2.setRole(Role.TEACHER);
        user2.setName("Teacher B");

        when(userRepository.findByPhone(phone)).thenReturn(List.of(user1, user2));
        when(passwordEncoder.matches(password, "hash1")).thenReturn(true);
        when(passwordEncoder.matches(password, "hash2")).thenReturn(false);
        when(jwtUtil.generateToken(anyString(), anyString(), anyString())).thenReturn("mock-token");

        AuthResponse response = authService.authenticate(request);

        // Since only one matches after filtering, it should log in directly
        assertNotNull(response.getToken());
        assertEquals("user1", response.getUserId());
        assertNull(response.getCandidates());
    }

    @Test
    void authenticate_NoMatchingPasswords_ThrowsException() {
        String phone = "9876543210";
        String password = "wrong-password";
        AuthRequest request = new AuthRequest();
        request.setPhone(phone);
        request.setPassword(password);

        User user1 = new User();
        user1.setPasswordHash("hash1");
        user1.setActive(true);

        when(userRepository.findByPhone(phone)).thenReturn(List.of(user1));
        when(passwordEncoder.matches(password, "hash1")).thenReturn(false);

        assertThrows(RuntimeException.class, () -> authService.authenticate(request));
    }

    @Test
    void authenticate_PrefixNormalization_Works() {
        String phone = "9876543210";
        String password = "password123";
        AuthRequest request = new AuthRequest();
        request.setPhone(phone);
        request.setPassword(password);

        User user = new User();
        user.setId("user1");
        user.setPasswordHash("hash1");
        user.setActive(true);
        user.setRole(Role.STUDENT);

        // First attempt with exact phone returns empty
        when(userRepository.findByPhone(phone)).thenReturn(Collections.emptyList());
        // Second attempt with +91 returns the user
        when(userRepository.findByPhone("+91" + phone)).thenReturn(List.of(user));
        when(passwordEncoder.matches(password, "hash1")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any(), any())).thenReturn("token");

        AuthResponse response = authService.authenticate(request);

        assertNotNull(response.getToken());
        assertEquals("user1", response.getUserId());
    }
}
