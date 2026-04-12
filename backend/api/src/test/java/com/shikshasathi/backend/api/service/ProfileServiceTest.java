package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.teacher.ProfileRequest;
import com.shikshasathi.backend.api.dto.teacher.ProfileResponse;
import com.shikshasathi.backend.core.domain.teacher.Profile;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.teacher.ProfileRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProfileServiceTest {

    @Mock
    private ProfileRepository profileRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;
    private Profile testProfile;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("user123");
        testUser.setEmail("teacher@test.com");
        testUser.setName("Teacher Name");

        testProfile = new Profile();
        testProfile.setUserId("user123");
        testProfile.setName("Teacher Name from Profile");
        testProfile.setSchool("Test School");
        testProfile.setBoard("CBSE");
    }

    @Test
    void getProfile_ExistingProfile_ReturnsSuccess() {
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.of(testProfile));

        ProfileResponse response = profileService.getProfile("teacher@test.com");

        assertNotNull(response);
        assertEquals("user123", response.getUserId());
        assertEquals("Teacher Name from Profile", response.getName());
        assertEquals("Test School", response.getSchool());
        assertEquals("CBSE", response.getBoard());
    }

    @Test
    void getProfile_NoProfileButUserExists_ReturnsDefaultProfile() {
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testUser));
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.empty());

        ProfileResponse response = profileService.getProfile("teacher@test.com");

        assertNotNull(response);
        assertEquals("user123", response.getUserId());
        // Should fallback to User's name if profile doesn't have it
        assertEquals("Teacher Name", response.getName());
        assertNull(response.getSchool());
    }

    @Test
    void getProfile_UserNotFound_ThrowsException() {
        when(userRepository.findByEmail("unknown@test.com")).thenReturn(Optional.empty());
        when(userRepository.findByPhone("unknown@test.com")).thenReturn(java.util.Collections.emptyList());

        assertThrows(UsernameNotFoundException.class, () -> profileService.getProfile("unknown@test.com"));
    }

    @Test
    void updateProfile_VerifiesAuthorization_ByEnforcingPrincipal() {
        when(userRepository.findByEmail("teacher@test.com")).thenReturn(Optional.of(testUser));
        
        // Simulating the user has no existing profile
        when(profileRepository.findByUserId("user123")).thenReturn(Optional.empty());
        
        ProfileRequest request = new ProfileRequest();
        request.setName("Updated Hacker Name");
        request.setSchool("Hacked School");
        request.setBoard("ICSE");

        Profile savedProfileParam = new Profile();
        savedProfileParam.setUserId("user123");
        savedProfileParam.setName("Updated Hacker Name");
        savedProfileParam.setSchool("Hacked School");
        savedProfileParam.setBoard("ICSE");

        when(profileRepository.save(any(Profile.class))).thenReturn(savedProfileParam);

        ProfileResponse response = profileService.updateProfile("teacher@test.com", request);

        // Security Validation (SSA-144)
        ArgumentCaptor<Profile> profileCaptor = ArgumentCaptor.forClass(Profile.class);
        verify(profileRepository).save(profileCaptor.capture());
        
        Profile captured = profileCaptor.getValue();
        // Forcefully ensure the ID written to the DB corresponds to the token, ignoring malicious fields
        assertEquals("user123", captured.getUserId());
        assertEquals("Updated Hacker Name", captured.getName());

        assertNotNull(response);
        assertEquals("user123", response.getUserId());
        assertEquals("Hacked School", response.getSchool());
    }
}
