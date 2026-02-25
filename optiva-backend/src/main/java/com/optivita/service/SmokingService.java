package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.smoking.SmokingAnalyticsResponse;
import com.optivita.dto.smoking.SmokingLogRequest;
import com.optivita.dto.smoking.SmokingLogResponse;
import com.optivita.entity.SmokingLog;
import com.optivita.entity.User;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.SmokingLogRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SmokingService {

    private final SmokingLogRepository smokingLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public SmokingLogResponse create(UUID userId, SmokingLogRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (smokingLogRepository.existsByUserIdAndLogDate(userId, request.getDate())) {
            throw new BadRequestException("Smoking log already exists for date: " + request.getDate());
        }

        SmokingLog log = SmokingLog.builder()
                .user(user)
                .logDate(request.getDate())
                .cigarettesCount(request.getCigarettesCount())
                .smokeFree(request.getSmokeFree())
                .cravings(request.getCravings())
                .notes(request.getNotes())
                .build();

        return mapToResponse(smokingLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<SmokingLogResponse> getAll(UUID userId) {
        return smokingLogRepository.findByUserIdOrderByLogDateDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<SmokingLogResponse> getAllPaged(UUID userId, int page, int size,
                                                        String sortBy, String sortDir,
                                                        LocalDate dateFrom, LocalDate dateTo) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "logDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SmokingLog> result;
        if (dateFrom != null && dateTo != null) {
            result = smokingLogRepository.findByUserIdAndLogDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = smokingLogRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<SmokingLogResponse>builder()
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
    public SmokingLogResponse getById(UUID userId, UUID logId) {
        SmokingLog log = smokingLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SmokingLog", "id", logId));
        return mapToResponse(log);
    }

    @Transactional
    public SmokingLogResponse update(UUID userId, UUID logId, SmokingLogRequest request) {
        SmokingLog log = smokingLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SmokingLog", "id", logId));

        if (request.getCigarettesCount() != null) log.setCigarettesCount(request.getCigarettesCount());
        if (request.getSmokeFree() != null) log.setSmokeFree(request.getSmokeFree());
        if (request.getCravings() != null) log.setCravings(request.getCravings());
        if (request.getNotes() != null) log.setNotes(request.getNotes());

        return mapToResponse(smokingLogRepository.save(log));
    }

    @Transactional
    public void delete(UUID userId, UUID logId) {
        SmokingLog log = smokingLogRepository.findByIdAndUserId(logId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("SmokingLog", "id", logId));
        smokingLogRepository.delete(log);
    }

    @Transactional(readOnly = true)
    public SmokingAnalyticsResponse getAnalytics(UUID userId) {
        // Smoke-free streak
        List<SmokingLog> allLogs = smokingLogRepository.findByUserIdOrderByLogDateDesc(userId);
        int streak = 0;
        LocalDate checkDate = LocalDate.now();
        for (SmokingLog log : allLogs) {
            if (log.getLogDate().equals(checkDate) && Boolean.TRUE.equals(log.getSmokeFree())) {
                streak++;
                checkDate = checkDate.minusDays(1);
            } else if (log.getLogDate().equals(checkDate)) {
                break;
            } else if (log.getLogDate().isBefore(checkDate)) {
                break;
            }
        }

        // Weekly avg cigarettes (last 7 days)
        LocalDate weekAgo = LocalDate.now().minusDays(7);
        List<SmokingLog> weekLogs = smokingLogRepository.findByUserIdAndDateBetween(userId, weekAgo, LocalDate.now());
        Double weeklyAvg = null;
        if (!weekLogs.isEmpty()) {
            double total = weekLogs.stream()
                    .filter(l -> l.getCigarettesCount() != null)
                    .mapToInt(SmokingLog::getCigarettesCount)
                    .sum();
            weeklyAvg = Math.round((total / 7) * 100.0) / 100.0;
        }

        // Trend points (last 30 days)
        LocalDate thirtyDaysAgo = LocalDate.now().minusDays(30);
        List<SmokingAnalyticsResponse.TrendPoint> trendPoints = smokingLogRepository
                .findByUserIdAndDateBetween(userId, thirtyDaysAgo, LocalDate.now())
                .stream()
                .map(l -> SmokingAnalyticsResponse.TrendPoint.builder()
                        .date(l.getLogDate())
                        .cigarettesCount(l.getCigarettesCount())
                        .smokeFree(l.getSmokeFree())
                        .cravings(l.getCravings())
                        .build())
                .toList();

        return SmokingAnalyticsResponse.builder()
                .smokeFreeStreak(streak)
                .weeklyAvgCigarettes(weeklyAvg)
                .trendPoints(trendPoints)
                .build();
    }

    private SmokingLogResponse mapToResponse(SmokingLog log) {
        return SmokingLogResponse.builder()
                .id(log.getId())
                .date(log.getLogDate())
                .cigarettesCount(log.getCigarettesCount())
                .smokeFree(log.getSmokeFree())
                .cravings(log.getCravings())
                .notes(log.getNotes())
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}
