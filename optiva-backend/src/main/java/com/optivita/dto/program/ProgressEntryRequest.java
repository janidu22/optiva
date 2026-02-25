package com.optivita.dto.program;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryRequest {

    @NotNull(message = "date is required")
    @PastOrPresent(message = "date must not be in the future")
    private LocalDate date;

    private Double weightKg;
    private Double waistCm;
    private Integer stepsAvg;
    private Integer workoutsCompleted;

    @Min(0) @Max(100)
    private Integer dietComplianceScore;

    private String notes;

    /** Optional list of photo URLs stored as-is. */
    private List<String> photos;
}
