package com.optivita.dto.program;

import com.optivita.entity.enums.CheckpointPhase;
import com.optivita.entity.enums.CheckpointStatus;
import com.optivita.entity.enums.FocusTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckpointResponse {

    private UUID id;
    private UUID programId;
    private LocalDate checkpointDate;
    private String title;
    private CheckpointPhase phase;
    private List<FocusTag> focusTags;
    private TargetMetricsDto targetMetrics;
    private Double targetWeightKg;
    private String notes;
    private CheckpointStatus status;
}
