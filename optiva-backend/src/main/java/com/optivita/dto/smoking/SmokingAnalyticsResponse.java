package com.optivita.dto.smoking;

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
public class SmokingAnalyticsResponse {

    private int smokeFreeStreak;
    private Double weeklyAvgCigarettes;
    private List<TrendPoint> trendPoints;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendPoint {
        private LocalDate date;
        private Integer cigarettesCount;
        private Boolean smokeFree;
        private Integer cravings;
    }
}
