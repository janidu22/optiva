package com.optivita.dto.alcohol;

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
public class AlcoholAnalyticsResponse {

    private Double unitsThisWeek;
    private int alcoholFreeStreak;
    private List<MonthlyTrend> monthlyTrend;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month; // e.g., "2026-02"
        private Double totalUnits;
        private long drinkingDays;
    }
}
