package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.journal.JournalEntryRequest;
import com.optivita.dto.journal.JournalEntryResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.JournalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/journal")
@RequiredArgsConstructor
@Tag(name = "Daily Journal", description = "Daily journal entries")
public class JournalController {

    private final JournalService journalService;

    @PostMapping
    @Operation(summary = "Create a journal entry (unique per user per date)")
    public ResponseEntity<JournalEntryResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JournalEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(journalService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all journal entries")
    public ResponseEntity<List<JournalEntryResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(journalService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get journal entries with pagination, sorting, date filtering and search")
    public ResponseEntity<PageResponse<JournalEntryResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "entryDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(journalService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo, search));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific journal entry")
    public ResponseEntity<JournalEntryResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(journalService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a journal entry")
    public ResponseEntity<JournalEntryResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody JournalEntryRequest request) {
        return ResponseEntity.ok(journalService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a journal entry")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        journalService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
