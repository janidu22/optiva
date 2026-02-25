package com.optivita.entity.enums;

/**
 * Result of an intelligent checkpoint evaluation
 * based on recent ProgressEntry data vs. targetMetrics.
 */
public enum EvaluationStatus {
    ON_TRACK,
    BEHIND,
    AHEAD
}
