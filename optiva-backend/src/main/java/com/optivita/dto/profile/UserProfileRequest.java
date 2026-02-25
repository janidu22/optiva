package com.optivita.dto.profile;

import com.optivita.entity.enums.Gender;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileRequest {

    @Min(value = 1, message = "Age must be at least 1")
    @Max(value = 150, message = "Age must be at most 150")
    private Integer age;

    @Positive(message = "Height must be positive")
    private Double heightCm;

    @Positive(message = "Starting weight must be positive")
    private Double startingWeightKg;

    @Positive(message = "Target weight must be positive")
    private Double targetWeightKg;

    @Size(max = 50)
    private String timezone;

    private Gender gender;
}
