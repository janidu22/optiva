package com.optivita.dto.calendar;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalendarDayResponse {

    private LocalDate date;
    private boolean hasWeight;
    private boolean hasJournal;
    private boolean hasMealPlan;
    private boolean hasWorkoutPlan;
    private long habitDoneCount;
    private long habitTotalCount;
    private boolean hasSmokingLog;
    private boolean hasAlcoholLog;
}
