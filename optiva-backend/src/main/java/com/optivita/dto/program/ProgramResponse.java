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
public class ProgramResponse {

    private UUID id;
    private UUID userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
    private List<CheckpointResponse> checkpoints;
    private Instant createdAt;
    private Instant updatedAt;
}
