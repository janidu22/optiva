package com.optivita.entity;

import com.optivita.entity.enums.CheckpointPhase;
import com.optivita.entity.enums.CheckpointStatus;
import com.optivita.entity.enums.FocusTag;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "checkpoints", indexes = {
        @Index(name = "idx_checkpoints_program_id", columnList = "program_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checkpoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    @Column(name = "checkpoint_date", nullable = false)
    private LocalDate checkpointDate;

    @Column(nullable = false, length = 100)
    private String title;

    // ── Fitness-phase classification ─────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "phase", length = 20)
    private CheckpointPhase phase;

    /**
     * Training focus areas for this milestone period.
     * Stored as a join-table to keep queries cleanly typed.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "checkpoint_focus_tags",
            joinColumns = @JoinColumn(name = "checkpoint_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "focus_tag", length = 20)
    @Builder.Default
    private List<FocusTag> focusTags = new ArrayList<>();

    /**
     * Quantitative targets for this phase.
     * Embedded directly on the checkpoints table as separate columns.
     */
    @Embedded
    private TargetMetrics targetMetrics;

    // ── Legacy / shared fields ────────────────────────────────────────────────
    @Column(name = "target_weight_kg")
    private Double targetWeightKg;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CheckpointStatus status = CheckpointStatus.UPCOMING;

    @Version
    private Integer version;
}
