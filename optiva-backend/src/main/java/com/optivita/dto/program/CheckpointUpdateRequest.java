package com.optivita.dto.program;

import com.optivita.entity.enums.CheckpointPhase;
import com.optivita.entity.enums.CheckpointStatus;
import com.optivita.entity.enums.FocusTag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckpointUpdateRequest {

    private CheckpointPhase phase;
    private List<FocusTag> focusTags;
    private TargetMetricsDto targetMetrics;
    private Double targetWeightKg;
    private String notes;
    private CheckpointStatus status;
}
