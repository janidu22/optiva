package com.optivita.dto.habit;

import com.optivita.entity.enums.HabitLogStatus;
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
public class HabitLogResponse {

    private UUID id;
    private UUID habitId;
    private LocalDate date;
    private HabitLogStatus status;
    private String notes;
    private Instant createdAt;
}
