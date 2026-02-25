package com.optivita.dto.meal;

import com.optivita.entity.enums.MealType;
import jakarta.validation.Valid;
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
public class MealRequest {

    @NotNull(message = "Meal type is required")
    private MealType mealType;

    @Valid
    private List<MealItemRequest> items;
}
