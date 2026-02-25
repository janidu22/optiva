package com.optivita.dto.meal;

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
public class MealPlanDayRequest {

    @NotNull(message = "Day of week is required")
    @Min(1) @Max(7)
    private Integer dayOfWeek;

    @Valid
    private List<MealRequest> meals;
}
