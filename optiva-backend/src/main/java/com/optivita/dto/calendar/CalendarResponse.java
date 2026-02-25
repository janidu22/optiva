package com.optivita.dto.calendar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarResponse {

    private List<CalendarDayResponse> days;
    private CalendarTotals totals;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CalendarTotals {
        private long daysWithWeight;
        private long daysWithJournal;
        private long daysWithMealPlan;
        private long daysWithWorkoutPlan;
        private long totalHabitsDone;
        private long totalHabitsLogged;
        private long daysWithSmokingLog;
        private long daysWithAlcoholLog;
    }
}
