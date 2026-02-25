package com.optivita.dto.journal;

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
public class JournalEntryResponse {

    private UUID id;
    private LocalDate date;
    private String ateNotes;
    private String tags;
    private Integer mood;
    private String emotions;
    private String notes;
    private Integer energy;
    private Double sleepHours;
    private Integer stress;
    private Instant createdAt;
    private Instant updatedAt;
}
