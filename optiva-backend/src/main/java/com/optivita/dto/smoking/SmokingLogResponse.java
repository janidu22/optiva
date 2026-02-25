package com.optivita.dto.smoking;

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
public class SmokingLogResponse {

    private UUID id;
    private LocalDate date;
    private Integer cigarettesCount;
    private Boolean smokeFree;
    private Integer cravings;
    private String notes;
    private Instant createdAt;
    private Instant updatedAt;
}
