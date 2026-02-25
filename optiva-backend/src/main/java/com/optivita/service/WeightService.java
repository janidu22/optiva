package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.weight.WeightEntryRequest;
import com.optivita.dto.weight.WeightEntryResponse;
import com.optivita.dto.weight.WeightStatsResponse;
import com.optivita.entity.Checkpoint;
import com.optivita.entity.Program;
import com.optivita.entity.User;
import com.optivita.entity.WeightEntry;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.ProgramRepository;
import com.optivita.repository.UserProfileRepository;
import com.optivita.repository.UserRepository;
import com.optivita.repository.WeightEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WeightService {

    private final WeightEntryRepository weightEntryRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final ProgramRepository programRepository;

    @Transactional
    public WeightEntryResponse create(UUID userId, WeightEntryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (weightEntryRepository.existsByUserIdAndEntryDate(userId, request.getDate())) {
            throw new BadRequestException("Weight entry already exists for date: " + request.getDate());
        }

        WeightEntry entry = WeightEntry.builder()
                .user(user)
                .entryDate(request.getDate())
                .weightKg(request.getWeightKg())
                .notes(request.getNotes())
                .build();

        return mapToResponse(weightEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<WeightEntryResponse> getAll(UUID userId) {
        return weightEntryRepository.findByUserIdOrderByEntryDateDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<WeightEntryResponse> getAllPaged(UUID userId, int page, int size,
                                                         String sortBy, String sortDir,
                                                         LocalDate dateFrom, LocalDate dateTo) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "entryDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<WeightEntry> result;
        if (dateFrom != null && dateTo != null) {
            result = weightEntryRepository.findByUserIdAndEntryDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = weightEntryRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<WeightEntryResponse>builder()
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
    public WeightEntryResponse getById(UUID userId, UUID entryId) {
        WeightEntry entry = weightEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WeightEntry", "id", entryId));
        return mapToResponse(entry);
    }

    @Transactional
    public WeightEntryResponse update(UUID userId, UUID entryId, WeightEntryRequest request) {
        WeightEntry entry = weightEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WeightEntry", "id", entryId));

        if (request.getDate() != null) entry.setEntryDate(request.getDate());
        if (request.getWeightKg() != null) entry.setWeightKg(request.getWeightKg());
        if (request.getNotes() != null) entry.setNotes(request.getNotes());

        return mapToResponse(weightEntryRepository.save(entry));
    }

    @Transactional
    public void delete(UUID userId, UUID entryId) {
        WeightEntry entry = weightEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WeightEntry", "id", entryId));
        weightEntryRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public WeightStatsResponse getStats(UUID userId) {
        WeightStatsResponse.WeightStatsResponseBuilder stats = WeightStatsResponse.builder();

        // Current weight (latest entry)
        weightEntryRepository.findFirstByUserIdOrderByEntryDateDesc(userId)
                .ifPresent(latest -> {
                    stats.currentWeight(latest.getWeightKg());
                    stats.currentWeightDate(latest.getEntryDate());
                });

        // Starting weight from profile or first entry
        Double startingWeight = profileRepository.findByUserId(userId)
                .map(p -> p.getStartingWeightKg())
                .orElseGet(() -> weightEntryRepository.findFirstByUserIdOrderByEntryDateAsc(userId)
                        .map(WeightEntry::getWeightKg)
                        .orElse(null));
        stats.startingWeight(startingWeight);

        // Total change
        WeightEntry latest = weightEntryRepository.findFirstByUserIdOrderByEntryDateDesc(userId).orElse(null);
        if (startingWeight != null && latest != null) {
            stats.totalChange(Math.round((latest.getWeightKg() - startingWeight) * 100.0) / 100.0);
        }

        // 7-day rolling average
        LocalDate sevenDaysAgo = LocalDate.now().minusDays(7);
        List<WeightEntry> recent = weightEntryRepository.findByUserIdAndDateFrom(userId, sevenDaysAgo);
        if (!recent.isEmpty()) {
            double avg = recent.stream().mapToDouble(WeightEntry::getWeightKg).average().orElse(0);
            stats.rollingAvg7Day(Math.round(avg * 100.0) / 100.0);
        }

        // Checkpoint progress
        List<Program> programs = programRepository.findByUserIdOrderByStartDateDesc(userId);
        List<WeightStatsResponse.CheckpointProgressItem> cpProgress = new ArrayList<>();
        for (Program program : programs) {
            for (Checkpoint cp : program.getCheckpoints()) {
                WeightEntry closestEntry = findClosestEntry(userId, cp.getCheckpointDate());
                cpProgress.add(WeightStatsResponse.CheckpointProgressItem.builder()
                        .title(cp.getTitle())
                        .checkpointDate(cp.getCheckpointDate())
                        .targetWeight(cp.getTargetWeightKg())
                        .actualWeight(closestEntry != null ? closestEntry.getWeightKg() : null)
                        .status(cp.getStatus().name())
                        .build());
            }
        }
        stats.checkpointProgress(cpProgress);

        return stats.build();
    }

    private WeightEntry findClosestEntry(UUID userId, LocalDate targetDate) {
        // Find entries within 3 days of the checkpoint date
        List<WeightEntry> nearby = weightEntryRepository.findByUserIdAndDateBetween(
                userId, targetDate.minusDays(3), targetDate.plusDays(3));
        if (nearby.isEmpty()) return null;

        return nearby.stream()
                .min((a, b) -> {
                    long diffA = Math.abs(a.getEntryDate().toEpochDay() - targetDate.toEpochDay());
                    long diffB = Math.abs(b.getEntryDate().toEpochDay() - targetDate.toEpochDay());
                    return Long.compare(diffA, diffB);
                })
                .orElse(null);
    }

    private WeightEntryResponse mapToResponse(WeightEntry entry) {
        return WeightEntryResponse.builder()
                .id(entry.getId())
                .date(entry.getEntryDate())
                .weightKg(entry.getWeightKg())
                .notes(entry.getNotes())
                .createdAt(entry.getCreatedAt())
                .build();
    }
}
