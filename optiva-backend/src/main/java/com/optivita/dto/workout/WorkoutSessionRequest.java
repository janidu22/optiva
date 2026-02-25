package com.optivita.dto.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutSessionRequest {

    @NotBlank(message = "Session name is required")
    private String name;

    @NotNull
    private Integer orderIndex;

    @Valid
    private List<ExerciseRequest> exercises;
}
