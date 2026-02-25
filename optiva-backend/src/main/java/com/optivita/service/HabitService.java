package com.optivita.service;

import com.optivita.dto.habit.*;
import com.optivita.entity.Habit;
import com.optivita.entity.HabitLog;
import com.optivita.entity.User;
import com.optivita.entity.enums.HabitLogStatus;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.HabitLogRepository;
import com.optivita.repository.HabitRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HabitService {

    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;
    private final UserRepository userRepository;

    // ---- Habit CRUD ----

    @Transactional
    public HabitResponse createHabit(UUID userId, HabitRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Habit habit = Habit.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return mapHabitToResponse(habitRepository.save(habit));
    }

    @Transactional(readOnly = true)
    public List<HabitResponse> getAllHabits(UUID userId) {
        return habitRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::mapHabitToResponse).toList();
    }

    @Transactional(readOnly = true)
    public HabitResponse getHabitById(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));
        return mapHabitToResponse(habit);
    }

    @Transactional
    public HabitResponse updateHabit(UUID userId, UUID habitId, HabitRequest request) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        if (request.getName() != null) habit.setName(request.getName());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());
        if (request.getIsActive() != null) habit.setIsActive(request.getIsActive());

        return mapHabitToResponse(habitRepository.save(habit));
    }

    @Transactional
    public void deleteHabit(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));
        habitRepository.delete(habit);
    }

    // ---- Habit Logs ----

    @Transactional
    public HabitLogResponse logHabit(UUID userId, UUID habitId, HabitLogRequest request) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        // Upsert: update if exists for that date, create otherwise
        HabitLog log = habitLogRepository.findByHabitIdAndLogDate(habitId, request.getDate())
                .orElse(HabitLog.builder().habit(habit).logDate(request.getDate()).build());

        log.setStatus(request.getStatus());
        log.setNotes(request.getNotes());

        return mapLogToResponse(habitLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<HabitLogResponse> getHabitLogs(UUID userId, UUID habitId) {
        habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        return habitLogRepository.findByHabitIdOrderByLogDateDesc(habitId)
                .stream().map(this::mapLogToResponse).toList();
    }

    // ---- Analytics ----

    @Transactional(readOnly = true)
    public HabitAnalyticsResponse getAnalytics(UUID userId, UUID habitId) {
        Habit habit = habitRepository.findByIdAndUserId(habitId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Habit", "id", habitId));

        LocalDate now = LocalDate.now();

        // Streak calculation
        List<HabitLog> logs = habitLogRepository.findByHabitIdOrderByLogDateDesc(habitId);
        int streak = 0;
        LocalDate checkDate = now;
        for (HabitLog log : logs) {
            if (log.getLogDate().equals(checkDate) && log.getStatus() == HabitLogStatus.DONE) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else if (log.getLogDate().equals(checkDate)) {
                break;
            } else if (log.getLogDate().isBefore(checkDate)) {
                break;
            }
        }

        // Adherence 7 day
        long done7 = habitLogRepository.countByHabitIdAndDateFromAndStatus(habitId, now.minusDays(7), HabitLogStatus.DONE);
        long total7 = habitLogRepository.countByHabitIdAndDateFrom(habitId, now.minusDays(7));
        double adherence7 = total7 > 0 ? Math.round(((double) done7 / 7) * 10000.0) / 100.0 : 0;

        // Adherence 30 day
        long done30 = habitLogRepository.countByHabitIdAndDateFromAndStatus(habitId, now.minusDays(30), HabitLogStatus.DONE);
        long total30 = habitLogRepository.countByHabitIdAndDateFrom(habitId, now.minusDays(30));
        double adherence30 = total30 > 0 ? Math.round(((double) done30 / 30) * 10000.0) / 100.0 : 0;

        // Totals
        long totalDone = habitLogRepository.countByHabitIdAndDateFromAndStatus(habitId, LocalDate.MIN, HabitLogStatus.DONE);
        long totalMissed = habitLogRepository.countByHabitIdAndDateFromAndStatus(habitId, LocalDate.MIN, HabitLogStatus.MISSED);
        long totalSkipped = habitLogRepository.countByHabitIdAndDateFromAndStatus(habitId, LocalDate.MIN, HabitLogStatus.SKIPPED);

        return HabitAnalyticsResponse.builder()
                .habitName(habit.getName())
                .currentStreak(streak)
                .adherence7Day(adherence7)
                .adherence30Day(adherence30)
                .totalDone(totalDone)
                .totalMissed(totalMissed)
                .totalSkipped(totalSkipped)
                .build();
    }

    private HabitResponse mapHabitToResponse(Habit habit) {
        return HabitResponse.builder()
                .id(habit.getId())
                .name(habit.getName())
                .description(habit.getDescription())
                .isActive(habit.getIsActive())
                .createdAt(habit.getCreatedAt())
                .updatedAt(habit.getUpdatedAt())
                .build();
    }

    private HabitLogResponse mapLogToResponse(HabitLog log) {
        return HabitLogResponse.builder()
                .id(log.getId())
                .habitId(log.getHabit().getId())
                .date(log.getLogDate())
                .status(log.getStatus())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
