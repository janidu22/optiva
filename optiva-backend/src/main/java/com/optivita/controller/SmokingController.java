package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.smoking.SmokingAnalyticsResponse;
import com.optivita.dto.smoking.SmokingLogRequest;
import com.optivita.dto.smoking.SmokingLogResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.SmokingService;
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
@RequestMapping("/v1/smoking")
@RequiredArgsConstructor
@Tag(name = "Smoking Tracking", description = "Track smoking and view analytics")
public class SmokingController {

    private final SmokingService smokingService;

    @PostMapping
    @Operation(summary = "Log smoking for a date (one per day)")
    public ResponseEntity<SmokingLogResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody SmokingLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(smokingService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all smoking logs")
    public ResponseEntity<List<SmokingLogResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(smokingService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get smoking logs with pagination, sorting and date filtering")
    public ResponseEntity<PageResponse<SmokingLogResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "logDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(smokingService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific smoking log")
    public ResponseEntity<SmokingLogResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(smokingService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a smoking log")
    public ResponseEntity<SmokingLogResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody SmokingLogRequest request) {
        return ResponseEntity.ok(smokingService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a smoking log")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        smokingService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get smoking analytics (streak, weekly avg, trends)")
    public ResponseEntity<SmokingAnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(smokingService.getAnalytics(principal.getId()));
    }
}
