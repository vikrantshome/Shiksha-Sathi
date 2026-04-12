package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.auth.AuthRequest;
import com.shikshasathi.backend.api.dto.auth.AuthResponse;
import com.shikshasathi.backend.api.dto.auth.SignupRequest;
import com.shikshasathi.backend.api.dto.auth.UserResponse;
import com.shikshasathi.backend.core.domain.user.Role;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import com.shikshasathi.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Returns the login identity for a user — email if present, otherwise phone.
     * This must match what UserDetailsService uses for the username.
     */
    private String getLoginIdentity(User user) {
        return (user.getEmail() != null && !user.getEmail().isBlank())
                ? user.getEmail() : user.getPhone();
    }

    public AuthResponse authenticate(AuthRequest request) {
        // Email-based login (single user expected)
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
            if (!user.isActive()) {
                throw new RuntimeException("User account is disabled");
            }

            user.setLastLoginAt(Instant.now().toEpochMilli());
            userRepository.save(user);

            String token = jwtUtil.generateToken(getLoginIdentity(user), user.getRole().name(), user.getId());
            return new AuthResponse(token, user.getId(), user.getName(), user.getSchool(), user.getRole(), null);
        }

        // Phone-based login (may return multiple users — e.g., sibling students)
        String phone = request.getPhone();
        if (phone == null || phone.isBlank()) {
            throw new RuntimeException("Invalid credentials");
        }

        // If selectUserId is provided, authenticate that specific user directly
        if (request.getSelectUserId() != null && !request.getSelectUserId().isBlank()) {
            User selectedUser = userRepository.findById(request.getSelectUserId())
                    .orElseThrow(() -> new RuntimeException("Invalid credentials"));

            if (!selectedUser.isActive()) {
                throw new RuntimeException("User account is disabled");
            }
            if (!selectedUser.getPhone().equals(phone)) {
                throw new RuntimeException("Invalid credentials");
            }
            if (!passwordEncoder.matches(request.getPassword(), selectedUser.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }

            selectedUser.setLastLoginAt(Instant.now().toEpochMilli());
            userRepository.save(selectedUser);

            String token = jwtUtil.generateToken(getLoginIdentity(selectedUser), selectedUser.getRole().name(), selectedUser.getId());
            return new AuthResponse(token, selectedUser.getId(), selectedUser.getName(), selectedUser.getSchool(), selectedUser.getRole(), null);
        }

        List<User> candidates = userRepository.findByPhone(phone);

        // Filter to active users only
        List<User> activeUsers = candidates.stream()
                .filter(User::isActive)
                .collect(Collectors.toList());

        if (activeUsers.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        // Separate teachers and students
        List<User> teachers = activeUsers.stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .collect(Collectors.toList());
        List<User> students = activeUsers.stream()
                .filter(u -> u.getRole() != Role.TEACHER)
                .collect(Collectors.toList());

        // If there's a teacher, they should be unique (enforced at signup). Login as teacher.
        if (!teachers.isEmpty()) {
            User teacher = teachers.get(0);
            if (!passwordEncoder.matches(request.getPassword(), teacher.getPasswordHash())) {
                throw new RuntimeException("Invalid credentials");
            }
            teacher.setLastLoginAt(Instant.now().toEpochMilli());
            userRepository.save(teacher);

            String token = jwtUtil.generateToken(getLoginIdentity(teacher), teacher.getRole().name(), teacher.getId());
            return new AuthResponse(token, teacher.getId(), teacher.getName(), teacher.getSchool(), teacher.getRole(), null);
        }

        // Multiple active students with same phone — verify password against any of them.
        // All students sharing a parent phone should have the same password (parent's choice).
        // Check password against the first student; if it matches, show profile picker.
        User firstStudent = students.get(0);
        if (!passwordEncoder.matches(request.getPassword(), firstStudent.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials");
        }

        // Update last login for the most recently active student
        students.sort(Comparator.comparing(User::getLastLoginAt, Comparator.nullsFirst(Long::compareTo)).reversed());
        User primaryStudent = students.get(0);
        primaryStudent.setLastLoginAt(Instant.now().toEpochMilli());
        userRepository.save(primaryStudent);

        // Return candidate profiles for frontend to show picker
        List<AuthResponse.CandidateProfile> profiles = students.stream()
                .map(u -> new AuthResponse.CandidateProfile(
                        u.getId(),
                        u.getName(),
                        u.getSchool(),
                        u.getRole(),
                        u.getStudentClass(),
                        u.getSection()
                ))
                .collect(Collectors.toList());

        return new AuthResponse(null, null, null, null, null, profiles);
    }

    public AuthResponse register(SignupRequest request) {
        // Check for duplicate email only if provided
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        // Enforce phone uniqueness for TEACHER role
        if (request.getRole() == Role.TEACHER) {
            List<User> existingTeachers = userRepository.findByPhoneAndRoleAndActive(
                    request.getPhone(), Role.TEACHER, true);
            if (!existingTeachers.isEmpty()) {
                throw new RuntimeException("A teacher account already exists with this phone number");
            }
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setSchool(request.getSchool());
        // Student-specific fields
        user.setRollNumber(request.getRollNumber());
        user.setStudentClass(request.getStudentClass());
        user.setSection(request.getSection());
        user.setActive(true);
        user.setCreatedAt(Instant.now());

        user = userRepository.save(user);

        // Use phone as login identity if email is not provided
        String loginIdentity = (user.getEmail() != null && !user.getEmail().isBlank())
                ? user.getEmail() : user.getPhone();
        String token = jwtUtil.generateToken(loginIdentity, user.getRole().name(), user.getId());

        return new AuthResponse(token, user.getId(), user.getName(), user.getSchool(), user.getRole(), null);
    }

    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByEmail(username)
                .or(() -> {
                    List<User> phoneUsers = userRepository.findByPhone(username);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getRollNumber(),
                user.getStudentClass(),
                user.getSection(),
                user.getSchool()
        );
    }
}
