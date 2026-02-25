package com.optivita.dto.smoking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmokingLogRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    @PositiveOrZero
    private Integer cigarettesCount;

    @NotNull(message = "Smoke free status is required")
    private Boolean smokeFree;

    @Min(1) @Max(10)
    private Integer cravings;

    private String notes;
}
