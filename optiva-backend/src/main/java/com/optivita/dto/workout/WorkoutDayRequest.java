package com.optivita.dto.workout;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class WorkoutDayRequest {

    @NotNull @Min(1) @Max(7)
    private Integer dayOfWeek;

    @Valid
    private List<WorkoutSessionRequest> sessions;
}
