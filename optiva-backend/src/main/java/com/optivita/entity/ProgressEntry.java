package com.optivita.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Frequent (weekly/bi-weekly) progress snapshots linked to a Program.
 * These feed into checkpoint evaluation analytics.
 *
 * Unlike milestones (Checkpoint), a ProgressEntry is lightweight and
 * intended to be logged often throughout the program duration.
 */
@Entity
@Table(name = "progress_entries", indexes = {
        @Index(name = "idx_progress_program_id", columnList = "program_id"),
        @Index(name = "idx_progress_date", columnList = "date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgressEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    /** Date of this progress snapshot (not necessarily today). */
    @Column(nullable = false)
    private LocalDate date;

    /** Body weight on the snapshot date, in kilograms. */
    @Column(name = "weight_kg")
    private Double weightKg;

    /** Waist circumference measurement in centimetres. */
    @Column(name = "waist_cm")
    private Double waistCm;

    /** Average daily steps during the tracked period. */
    @Column(name = "steps_avg")
    private Integer stepsAvg;

    /** Number of workouts completed in the tracked period. */
    @Column(name = "workouts_completed")
    private Integer workoutsCompleted;

    /**
     * Self-reported diet compliance score (0–100).
     * 100 = followed meal plan perfectly.
     */
    @Column(name = "diet_compliance_score")
    private Integer dietComplianceScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    /**
     * Comma-separated photo URLs (optional).
     * For a production system, replace with a proper media relation.
     */
    @Column(name = "photos", columnDefinition = "TEXT")
    private String photos;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    private Integer version;
}
