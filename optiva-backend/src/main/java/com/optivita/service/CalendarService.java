package com.optivita.service;

import com.optivita.dto.calendar.CalendarDayResponse;
import com.optivita.dto.calendar.CalendarResponse;
import com.optivita.entity.*;
import com.optivita.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final WeightEntryRepository weightEntryRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final MealPlanRepository mealPlanRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final HabitLogRepository habitLogRepository;
    private final HabitRepository habitRepository;
    private final SmokingLogRepository smokingLogRepository;
    private final AlcoholLogRepository alcoholLogRepository;

    @Transactional(readOnly = true)
    public CalendarResponse getCalendar(UUID userId, LocalDate from, LocalDate to) {
        // Fetch all relevant data in the range
        Set<LocalDate> weightDates = weightEntryRepository.findByUserIdAndDateBetween(userId, from, to)
                .stream().map(WeightEntry::getEntryDate).collect(Collectors.toSet());

        Set<LocalDate> journalDates = journalEntryRepository.findByUserIdOrderByEntryDateDesc(userId)
                .stream().filter(j -> !j.getEntryDate().isBefore(from) && !j.getEntryDate().isAfter(to))
                .map(JournalEntry::getEntryDate).collect(Collectors.toSet());

        // Meal plans cover a week; mark all 7 days if a plan's week intersects the range
        Set<LocalDate> mealPlanDates = new HashSet<>();
        mealPlanRepository.findByUserIdOrderByWeekStartDateDesc(userId).forEach(plan -> {
            LocalDate weekEnd = plan.getWeekStartDate().plusDays(6);
            if (!plan.getWeekStartDate().isAfter(to) && !weekEnd.isBefore(from)) {
                for (LocalDate d = plan.getWeekStartDate(); !d.isAfter(weekEnd); d = d.plusDays(1)) {
                    if (!d.isBefore(from) && !d.isAfter(to)) mealPlanDates.add(d);
                }
            }
        });

        Set<LocalDate> workoutPlanDates = new HashSet<>();
        workoutPlanRepository.findByUserIdOrderByWeekStartDateDesc(userId).forEach(plan -> {
            LocalDate weekEnd = plan.getWeekStartDate().plusDays(6);
            if (!plan.getWeekStartDate().isAfter(to) && !weekEnd.isBefore(from)) {
                for (LocalDate d = plan.getWeekStartDate(); !d.isAfter(weekEnd); d = d.plusDays(1)) {
                    if (!d.isBefore(from) && !d.isAfter(to)) workoutPlanDates.add(d);
                }
            }
        });

        Set<LocalDate> smokingDates = smokingLogRepository.findByUserIdAndDateBetween(userId, from, to)
                .stream().map(SmokingLog::getLogDate).collect(Collectors.toSet());

        Set<LocalDate> alcoholDates = alcoholLogRepository.findByUserIdAndDateBetween(userId, from, to)
                .stream().map(AlcoholLog::getLogDate).collect(Collectors.toSet());

        // Active habits count for the user
        long activeHabitsCount = habitRepository.findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(userId).size();

        // Build day responses
        List<CalendarDayResponse> days = new ArrayList<>();
        long totalHabitsDone = 0;
        long totalHabitsLogged = 0;

        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            long habitDone = habitLogRepository.countDoneByUserIdAndDate(userId, date);
            long habitTotal = habitLogRepository.countByUserIdAndDate(userId, date);

            totalHabitsDone += habitDone;
            totalHabitsLogged += habitTotal;

            days.add(CalendarDayResponse.builder()
                    .date(date)
                    .hasWeight(weightDates.contains(date))
                    .hasJournal(journalDates.contains(date))
                    .hasMealPlan(mealPlanDates.contains(date))
                    .hasWorkoutPlan(workoutPlanDates.contains(date))
                    .habitDoneCount(habitDone)
                    .habitTotalCount(habitTotal > 0 ? habitTotal : activeHabitsCount)
                    .hasSmokingLog(smokingDates.contains(date))
                    .hasAlcoholLog(alcoholDates.contains(date))
                    .build());
        }

        CalendarResponse.CalendarTotals totals = CalendarResponse.CalendarTotals.builder()
                .daysWithWeight(weightDates.size())
                .daysWithJournal(journalDates.size())
                .daysWithMealPlan(mealPlanDates.size())
                .daysWithWorkoutPlan(workoutPlanDates.size())
                .totalHabitsDone(totalHabitsDone)
                .totalHabitsLogged(totalHabitsLogged)
                .daysWithSmokingLog(smokingDates.size())
                .daysWithAlcoholLog(alcoholDates.size())
                .build();

        return CalendarResponse.builder()
                .days(days)
                .totals(totals)
                .build();
    }
}
