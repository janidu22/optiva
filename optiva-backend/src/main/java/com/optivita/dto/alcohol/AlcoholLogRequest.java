package com.optivita.dto.alcohol;

import com.optivita.entity.enums.DrinkType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlcoholLogRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotNull(message = "Drink type is required")
    private DrinkType drinkType;

    private String customName;

    @NotNull(message = "Units is required")
    @Positive
    private Double units;

    @Positive
    private Double volumeMl;

    private String notes;
}
