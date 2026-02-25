package com.optivita.dto.weight;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeightEntryResponse {

    private UUID id;
    private LocalDate date;
    private Double weightKg;
    private String notes;
    private Instant createdAt;
}
