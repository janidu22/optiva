package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.weight.WeightEntryRequest;
import com.optivita.dto.weight.WeightEntryResponse;
import com.optivita.dto.weight.WeightStatsResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.WeightService;
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
@RequestMapping("/v1/weight")
@RequiredArgsConstructor
@Tag(name = "Weight Tracking", description = "Track weight entries and view stats")
public class WeightController {

    private final WeightService weightService;

    @PostMapping
    @Operation(summary = "Log a weight entry")
    public ResponseEntity<WeightEntryResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WeightEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(weightService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all weight entries")
    public ResponseEntity<List<WeightEntryResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(weightService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get weight entries with pagination, sorting and date filtering")
    public ResponseEntity<PageResponse<WeightEntryResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "entryDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(weightService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific weight entry")
    public ResponseEntity<WeightEntryResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(weightService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a weight entry")
    public ResponseEntity<WeightEntryResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody WeightEntryRequest request) {
        return ResponseEntity.ok(weightService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a weight entry")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        weightService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    @Operation(summary = "Get weight statistics for dashboard")
    public ResponseEntity<WeightStatsResponse> getStats(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(weightService.getStats(principal.getId()));
    }
}
