package com.optivita.entity.enums;

/**
 * Represents the training phase associated with a transformation checkpoint.
 *
 * Progression order for a standard 12-month program:
 *   FOUNDATION → CUT_1 → BUILD → CUT_2 → MAINTAIN
 */
public enum CheckpointPhase {
    /** Weeks 1–4: Habit formation, baseline tracking, onboarding. */
    FOUNDATION,
    /** Weeks 5–12: Primary fat-loss phase with caloric deficit. */
    CUT_1,
    /** Months 3–6: Recomposition / muscle preservation and gradual strength focus. */
    BUILD,
    /** Months 7–9: Secondary refinement / definition cut. */
    CUT_2,
    /** Months 10–12: Sustainable lifestyle, maintenance calories, long-term adherence. */
    MAINTAIN
}
