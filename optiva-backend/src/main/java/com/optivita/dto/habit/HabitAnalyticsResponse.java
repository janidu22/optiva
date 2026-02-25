package com.optivita.dto.habit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabitAnalyticsResponse {

    private String habitName;
    private int currentStreak;
    private double adherence7Day;
    private double adherence30Day;
    private long totalDone;
    private long totalMissed;
    private long totalSkipped;
}
