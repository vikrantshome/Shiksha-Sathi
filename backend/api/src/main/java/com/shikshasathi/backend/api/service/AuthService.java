package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.auth.AuthRequest;
import com.shikshasathi.backend.api.dto.auth.AuthResponse;
import com.shikshasathi.backend.api.dto.auth.SignupRequest;
import com.shikshasathi.backend.api.dto.auth.UpdateProfileRequest;
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
        // Handle potential +91 prefix mismatch
        if (candidates.isEmpty() && phone.length() == 10) {
            candidates = userRepository.findByPhone("+91" + phone);
        } else if (candidates.isEmpty() && phone.startsWith("+91") && phone.length() == 13) {
            candidates = userRepository.findByPhone(phone.substring(3));
        }

        // Filter to active users who match the password
        List<User> matchingUsers = candidates.stream()
                .filter(User::isActive)
                .filter(u -> passwordEncoder.matches(request.getPassword(), u.getPasswordHash()))
                .collect(Collectors.toList());

        if (matchingUsers.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        // If there's only one matching user, log them in directly
        if (matchingUsers.size() == 1) {
            User user = matchingUsers.get(0);
            user.setLastLoginAt(Instant.now().toEpochMilli());
            userRepository.save(user);

            String token = jwtUtil.generateToken(getLoginIdentity(user), user.getRole().name(), user.getId());
            return new AuthResponse(token, user.getId(), user.getName(), user.getSchool(), user.getRole(), null);
        }

        // Multiple active users match the same password — return candidate profiles for frontend to show picker
        List<AuthResponse.CandidateProfile> profiles = matchingUsers.stream()
                .map(u -> new AuthResponse.CandidateProfile(
                        u.getId(),
                        u.getName(),
                        u.getSchool(),
                        u.getRole(),
                        u.getStudentClass(),
                        u.getSection(),
                        u.getRollNumber()
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
                user.getSchool(),
                user.getBirthDate()
        );
    }

    public UserResponse updateCurrentUser(String username, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(username)
                .or(() -> {
                    List<User> phoneUsers = userRepository.findByPhone(username);
                    return phoneUsers.isEmpty() ? java.util.Optional.empty() : java.util.Optional.of(phoneUsers.get(0));
                })
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }

        if (request.getBirthDate() != null) {
            user.setBirthDate(request.getBirthDate());
        }

        if (request.getRollNumber() != null) {
            user.setRollNumber(request.getRollNumber());
        }

        if (request.getStudentClass() != null) {
            user.setStudentClass(request.getStudentClass());
        }

        if (request.getSection() != null) {
            user.setSection(request.getSection());
        }

        if (request.getSchool() != null) {
            user.setSchool(request.getSchool());
        }

        user = userRepository.save(user);

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getRollNumber(),
                user.getStudentClass(),
                user.getSection(),
                user.getSchool(),
                user.getBirthDate()
        );
    }
}
