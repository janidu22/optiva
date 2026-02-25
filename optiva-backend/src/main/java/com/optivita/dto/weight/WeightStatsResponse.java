package com.optivita.dto.weight;

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
public class WeightStatsResponse {

    private Double currentWeight;
    private LocalDate currentWeightDate;
    private Double startingWeight;
    private Double totalChange;
    private Double rollingAvg7Day;
    private List<CheckpointProgressItem> checkpointProgress;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CheckpointProgressItem {
        private String title;
        private LocalDate checkpointDate;
        private Double targetWeight;
        private Double actualWeight;
        private String status;
    }
}
