package com.optivita.dto.program;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Quantitative performance targets for a checkpoint phase.
 * All fields are optional — null means "not tracked for this phase".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TargetMetricsDto {

    /** Expected weight change by this checkpoint in kg. Negative = loss. */
    private Double targetWeightChangeKg;

    /** Expected waist change in cm. Negative = reduction. */
    private Double targetWaistChangeCm;

    /** Minimum workout sessions per week to be considered ON_TRACK. */
    private Integer trainingDaysPerWeek;

    /** Target average daily step count. */
    private Integer stepsAverage;

    /** Diet compliance target, 0–100 %. */
    private Integer dietComplianceTarget;
}
