package com.optivita.dto.meal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealItemRequest {

    @NotBlank(message = "Item name is required")
    private String name;

    private String portion;

    @Positive
    private Integer calories;

    @Positive
    private Double proteinG;

    @Positive
    private Double carbsG;

    @Positive
    private Double fatG;
}
