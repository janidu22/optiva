package com.optivita.service;

import com.optivita.dto.profile.UserProfileRequest;
import com.optivita.dto.profile.UserProfileResponse;
import com.optivita.entity.User;
import com.optivita.entity.UserProfile;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.UserProfileRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfile profile = profileRepository.findByUserId(userId).orElse(null);
        return mapToResponse(user, profile);
    }

    @Transactional
    public UserProfileResponse createOrUpdateProfile(UUID userId, UserProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        UserProfile profile = profileRepository.findByUserId(userId)
                .orElse(UserProfile.builder().user(user).build());

        if (request.getAge() != null) profile.setAge(request.getAge());
        if (request.getHeightCm() != null) profile.setHeightCm(request.getHeightCm());
        if (request.getStartingWeightKg() != null) profile.setStartingWeightKg(request.getStartingWeightKg());
        if (request.getTargetWeightKg() != null) profile.setTargetWeightKg(request.getTargetWeightKg());
        if (request.getTimezone() != null) profile.setTimezone(request.getTimezone());
        if (request.getGender() != null) profile.setGender(request.getGender());

        profile = profileRepository.save(profile);
        return mapToResponse(user, profile);
    }

    private UserProfileResponse mapToResponse(User user, UserProfile profile) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName());

        if (profile != null) {
            builder.id(profile.getId())
                    .age(profile.getAge())
                    .heightCm(profile.getHeightCm())
                    .startingWeightKg(profile.getStartingWeightKg())
                    .targetWeightKg(profile.getTargetWeightKg())
                    .timezone(profile.getTimezone())
                    .gender(profile.getGender())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt());
        }

        return builder.build();
    }
}
