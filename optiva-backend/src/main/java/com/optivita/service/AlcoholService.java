package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.alcohol.AlcoholAnalyticsResponse;
import com.optivita.dto.alcohol.AlcoholLogRequest;
import com.optivita.dto.alcohol.AlcoholLogResponse;
import com.optivita.entity.AlcoholLog;
import com.optivita.entity.User;
import com.optivita.entity.enums.DrinkType;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.AlcoholLogRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlcoholService {

    private final AlcoholLogRepository alcoholLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public AlcoholLogResponse create(UUID userId, AlcoholLogRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        AlcoholLog log = AlcoholLog.builder()
                .user(user)
                .logDate(request.getDate())
                .drinkType(request.getDrinkType())
                .customName(request.getCustomName())
                .units(request.getUnits())
                .volumeMl(request.getVolumeMl())
                .notes(request.getNotes())
                .build();

        return mapToResponse(alcoholLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<AlcoholLogResponse> getAll(UUID userId) {
        return alcoholLogRepository.findByUserIdOrderByLogDateDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<AlcoholLogResponse> getAllPaged(UUID userId, int page, int size,
                                                        String sortBy, String sortDir,
                                                        LocalDate dateFrom, LocalDate dateTo,
                                                        DrinkType drinkType) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "logDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<AlcoholLog> result;
        boolean hasDateRange = dateFrom != null && dateTo != null;
        boolean hasType = drinkType != null;

        if (hasDateRange && hasType) {
            result = alcoholLogRepository.findByUserIdAndDateBetweenAndDrinkType(userId, dateFrom, dateTo, drinkType, pageable);
        } else if (hasType) {
            result = alcoholLogRepository.findByUserIdAndDrinkType(userId, drinkType, pageable);
        } else if (hasDateRange) {
            result = alcoholLogRepository.findByUserIdAndLogDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = alcoholLogRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<AlcoholLogResponse>builder()
                .content(result.getContent().stream().map(this::mapToResponse).toList())
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .first(result.isFirst())
                .last(result.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public AlcoholLogResponse getById(UUID userId, UUID logId) {
        AlcoholLog log = alcoholLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlcoholLog", "id", logId));
        return mapToResponse(log);
    }

    @Transactional
    public AlcoholLogResponse update(UUID userId, UUID logId, AlcoholLogRequest request) {
        AlcoholLog log = alcoholLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlcoholLog", "id", logId));

        if (request.getDrinkType() != null) log.setDrinkType(request.getDrinkType());
        if (request.getCustomName() != null) log.setCustomName(request.getCustomName());
        if (request.getUnits() != null) log.setUnits(request.getUnits());
        if (request.getVolumeMl() != null) log.setVolumeMl(request.getVolumeMl());
        if (request.getNotes() != null) log.setNotes(request.getNotes());

        return mapToResponse(alcoholLogRepository.save(log));
    }

    @Transactional
    public void delete(UUID userId, UUID logId) {
        AlcoholLog log = alcoholLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("AlcoholLog", "id", logId));
        alcoholLogRepository.delete(log);
    }

    @Transactional(readOnly = true)
    public AlcoholAnalyticsResponse getAnalytics(UUID userId) {
        LocalDate today = LocalDate.now();

        // Units this week (Mon-Sun)
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);
        Double unitsThisWeek = alcoholLogRepository.sumUnitsByUserIdAndDateBetween(userId, weekStart, today);

        // Alcohol-free streak: count consecutive days backward with no alcohol
        List<AlcoholLog> allLogs = alcoholLogRepository.findByUserIdOrderByLogDateDesc(userId);
        Set<LocalDate> drinkingDates = allLogs.stream()
                .map(AlcoholLog::getLogDate)
                .collect(Collectors.toSet());

        int streak = 0;
        LocalDate checkDate = today;
        while (!drinkingDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
            if (streak > 365) break; // safety limit
        }

        // Monthly trend (last 6 months)
        List<AlcoholAnalyticsResponse.MonthlyTrend> monthlyTrend = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            YearMonth ym = YearMonth.from(today.minusMonths(i));
            LocalDate monthStart = ym.atDay(1);
            LocalDate monthEnd = ym.atEndOfMonth();

            List<AlcoholLog> monthLogs = alcoholLogRepository.findByUserIdAndDateBetween(userId, monthStart, monthEnd);
            double totalUnits = monthLogs.stream().mapToDouble(AlcoholLog::getUnits).sum();
            long daysWithDrinks = monthLogs.stream().map(AlcoholLog::getLogDate).distinct().count();

            monthlyTrend.add(AlcoholAnalyticsResponse.MonthlyTrend.builder()
                    .month(ym.format(DateTimeFormatter.ofPattern("yyyy-MM")))
                    .totalUnits(Math.round(totalUnits * 100.0) / 100.0)
                    .drinkingDays(daysWithDrinks)
                    .build());
        }

        return AlcoholAnalyticsResponse.builder()
                .unitsThisWeek(unitsThisWeek)
                .alcoholFreeStreak(streak)
                .monthlyTrend(monthlyTrend)
                .build();
    }

    private AlcoholLogResponse mapToResponse(AlcoholLog log) {
        return AlcoholLogResponse.builder()
                .id(log.getId())
                .date(log.getLogDate())
                .drinkType(log.getDrinkType())
                .customName(log.getCustomName())
                .units(log.getUnits())
                .volumeMl(log.getVolumeMl())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
