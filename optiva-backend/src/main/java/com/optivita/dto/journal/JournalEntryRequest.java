package com.optivita.dto.journal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class JournalEntryRequest {

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String ateNotes;
    private String tags; // comma-separated

    @Min(1) @Max(10)
    private Integer mood;

    private String emotions;
    private String notes;

    @Min(1) @Max(10)
    private Integer energy;

    @Positive
    private Double sleepHours;

    @Min(1) @Max(10)
    private Integer stress;
}
