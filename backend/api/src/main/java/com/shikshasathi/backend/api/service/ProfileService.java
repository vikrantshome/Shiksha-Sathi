package com.shikshasathi.backend.api.service;

import com.shikshasathi.backend.api.dto.teacher.ProfileRequest;
import com.shikshasathi.backend.api.dto.teacher.ProfileResponse;
import com.shikshasathi.backend.core.domain.teacher.Profile;
import com.shikshasathi.backend.core.domain.user.User;
import com.shikshasathi.backend.infrastructure.repository.teacher.ProfileRepository;
import com.shikshasathi.backend.infrastructure.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getProfile(String username) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(new Profile());

        return ProfileResponse.builder()
                .userId(user.getId())
                .name(profile.getName() != null ? profile.getName() : user.getName())
                .school(profile.getSchool())
                .board(profile.getBoard())
                .build();
    }

    public ProfileResponse updateProfile(String username, ProfileRequest request) {
        User user = userRepository.findByEmail(username)
                .or(() -> userRepository.findByPhone(username))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Profile profile = profileRepository.findByUserId(user.getId())
                .orElse(new Profile());

        profile.setUserId(user.getId());
        profile.setName(request.getName());
        profile.setSchool(request.getSchool());
        profile.setBoard(request.getBoard());

        Profile savedProfile = profileRepository.save(profile);

        return ProfileResponse.builder()
                .userId(savedProfile.getUserId())
                .name(savedProfile.getName())
                .school(savedProfile.getSchool())
                .board(savedProfile.getBoard())
                .build();
    }
}
