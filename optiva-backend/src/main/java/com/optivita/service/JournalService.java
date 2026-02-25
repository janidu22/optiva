package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.journal.JournalEntryRequest;
import com.optivita.dto.journal.JournalEntryResponse;
import com.optivita.entity.JournalEntry;
import com.optivita.entity.User;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.JournalEntryRepository;
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
public class JournalService {

    private final JournalEntryRepository journalEntryRepository;
    private final UserRepository userRepository;

    @Transactional
    public JournalEntryResponse create(UUID userId, JournalEntryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (journalEntryRepository.existsByUserIdAndEntryDate(userId, request.getDate())) {
            throw new BadRequestException("Journal entry already exists for date: " + request.getDate());
        }

        JournalEntry entry = JournalEntry.builder()
                .user(user)
                .entryDate(request.getDate())
                .ateNotes(request.getAteNotes())
                .tags(request.getTags())
                .mood(request.getMood())
                .emotions(request.getEmotions())
                .notes(request.getNotes())
                .energy(request.getEnergy())
                .sleepHours(request.getSleepHours())
                .stress(request.getStress())
                .build();

        return mapToResponse(journalEntryRepository.save(entry));
    }

    @Transactional(readOnly = true)
    public List<JournalEntryResponse> getAll(UUID userId) {
        return journalEntryRepository.findByUserIdOrderByEntryDateDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<JournalEntryResponse> getAllPaged(UUID userId, int page, int size,
                                                          String sortBy, String sortDir,
                                                          LocalDate dateFrom, LocalDate dateTo,
                                                          String search) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "entryDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<JournalEntry> result;
        boolean hasDateRange = dateFrom != null && dateTo != null;
        boolean hasSearch = search != null && !search.isBlank();

        if (hasDateRange && hasSearch) {
            result = journalEntryRepository.searchByUserIdAndDateBetween(userId, dateFrom, dateTo, search.trim(), pageable);
        } else if (hasSearch) {
            result = journalEntryRepository.searchByUserId(userId, search.trim(), pageable);
        } else if (hasDateRange) {
            result = journalEntryRepository.findByUserIdAndEntryDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = journalEntryRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<JournalEntryResponse>builder()
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
    public JournalEntryResponse getById(UUID userId, UUID entryId) {
        JournalEntry entry = journalEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", "id", entryId));
        return mapToResponse(entry);
    }

    @Transactional
    public JournalEntryResponse update(UUID userId, UUID entryId, JournalEntryRequest request) {
        JournalEntry entry = journalEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", "id", entryId));

        if (request.getAteNotes() != null) entry.setAteNotes(request.getAteNotes());
        if (request.getTags() != null) entry.setTags(request.getTags());
        if (request.getMood() != null) entry.setMood(request.getMood());
        if (request.getEmotions() != null) entry.setEmotions(request.getEmotions());
        if (request.getNotes() != null) entry.setNotes(request.getNotes());
        if (request.getEnergy() != null) entry.setEnergy(request.getEnergy());
        if (request.getSleepHours() != null) entry.setSleepHours(request.getSleepHours());
        if (request.getStress() != null) entry.setStress(request.getStress());

        return mapToResponse(journalEntryRepository.save(entry));
    }

    @Transactional
    public void delete(UUID userId, UUID entryId) {
        JournalEntry entry = journalEntryRepository.findByIdAndUserId(entryId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("JournalEntry", "id", entryId));
        journalEntryRepository.delete(entry);
    }

    private JournalEntryResponse mapToResponse(JournalEntry e) {
        return JournalEntryResponse.builder()
                .id(e.getId())
                .date(e.getEntryDate())
                .ateNotes(e.getAteNotes())
                .tags(e.getTags())
                .mood(e.getMood())
                .emotions(e.getEmotions())
                .notes(e.getNotes())
                .energy(e.getEnergy())
                .sleepHours(e.getSleepHours())
                .stress(e.getStress())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
