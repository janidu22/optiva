package com.optivita.dto.profile;

import com.optivita.entity.enums.Gender;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private UUID id;
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private Integer age;
    private Double heightCm;
    private Double startingWeightKg;
    private Double targetWeightKg;
    private String timezone;
    private Gender gender;
    private Instant createdAt;
    private Instant updatedAt;
}
