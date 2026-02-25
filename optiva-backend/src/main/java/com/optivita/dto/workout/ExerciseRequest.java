package com.optivita.dto.workout;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseRequest {

    @NotBlank(message = "Exercise name is required")
    private String name;

    @NotNull(message = "Sets is required")
    @Positive
    private Integer sets;

    @NotNull(message = "Reps is required")
    @Positive
    private Integer reps;

    @Positive
    private Double duration;

    @Positive
    private Double weight;

    @NotNull
    private Integer orderIndex;
}
