package com.optivita.dto.program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressEntryResponse {

    private UUID id;
    private UUID programId;
    private LocalDate date;
    private Double weightKg;
    private Double waistCm;
    private Integer stepsAvg;
    private Integer workoutsCompleted;
    private Integer dietComplianceScore;
    private String notes;
    private List<String> photos;
    private Instant createdAt;
    private Instant updatedAt;
}
