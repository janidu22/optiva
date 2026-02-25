package com.optivita.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

/**
 * Target performance metrics for a single checkpoint period.
 * Stored as embedded columns on the Checkpoint table.
 *
 * Fields use nullable primitives so they can be partially defined per phase.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TargetMetrics {

    /**
     * Expected weight change in kg by this checkpoint.
     * Negative value = weight loss goal (e.g. -4.0 = lose 4 kg).
     */
    @Column(name = "target_weight_change_kg")
    private Double targetWeightChangeKg;

    /**
     * Expected waist circumference change in cm.
     * Negative = reduction (e.g. -3.0 = lose 3 cm).
     */
    @Column(name = "target_waist_change_cm")
    private Double targetWaistChangeCm;

    /** Minimum training sessions per week to be ON_TRACK. */
    @Column(name = "training_days_per_week")
    private Integer trainingDaysPerWeek;

    /** Daily step target for this phase. */
    @Column(name = "steps_average")
    private Integer stepsAverage;

    /**
     * Diet compliance percentage target (0–100).
     * e.g. 80 means 80 % of planned meals were eaten as logged.
     */
    @Column(name = "diet_compliance_target")
    private Integer dietComplianceTarget;
}
