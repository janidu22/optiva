package com.optivita.dto.meal;

import com.optivita.entity.enums.MealType;
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
public class MealPlanResponse {

    private UUID id;
    private LocalDate weekStartDate;
    private List<DayResponse> days;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DayResponse {
        private UUID id;
        private Integer dayOfWeek;
        private List<MealResponse> meals;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MealResponse {
        private UUID id;
        private MealType mealType;
        private List<ItemResponse> items;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResponse {
        private UUID id;
        private String name;
        private String portion;
        private Integer calories;
        private Double proteinG;
        private Double carbsG;
        private Double fatG;
    }
}
