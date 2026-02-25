package com.optivita.dto.program;

import com.optivita.entity.enums.EvaluationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Result of an intelligent checkpoint evaluation.
 * Summarises recent progress vs. targetMetrics and returns an overall status.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckpointEvaluationResponse {

    private UUID checkpointId;
    private String checkpointTitle;
    private LocalDate checkpointDate;

    /** Overall verdict based on weighted metric comparison. */
    private EvaluationStatus status;

    /** Human-readable summary of the evaluation reasoning. */
    private String summary;

    /** Number of ProgressEntry records used for this evaluation. */
    private int entriesAnalyzed;

    // ── Observed vs. target breakdown ────────────────────────────────────────
    private Double avgWeightChangeKg;
    private Double targetWeightChangeKg;

    private Double avgWaistChangeCm;
    private Double targetWaistChangeCm;

    private Double avgWorkoutsPerWeek;
    private Integer targetTrainingDaysPerWeek;

    private Double avgStepsAvg;
    private Integer targetStepsAverage;

    private Double avgDietCompliance;
    private Integer targetDietCompliance;
}
