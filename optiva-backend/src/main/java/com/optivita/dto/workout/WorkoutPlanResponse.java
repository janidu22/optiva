package com.optivita.dto.workout;

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
public class WorkoutPlanResponse {

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
        private List<SessionResponse> sessions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SessionResponse {
        private UUID id;
        private String name;
        private Integer orderIndex;
        private List<ExerciseResponse> exercises;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseResponse {
        private UUID id;
        private String name;
        private Integer sets;
        private Integer reps;
        private Double duration;
        private Double weight;
        private Integer orderIndex;
    }
}
