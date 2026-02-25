package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.alcohol.AlcoholAnalyticsResponse;
import com.optivita.dto.alcohol.AlcoholLogRequest;
import com.optivita.dto.alcohol.AlcoholLogResponse;
import com.optivita.entity.enums.DrinkType;
import com.optivita.security.UserPrincipal;
import com.optivita.service.AlcoholService;
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
@RequestMapping("/v1/alcohol")
@RequiredArgsConstructor
@Tag(name = "Alcohol Tracking", description = "Track alcohol consumption and view analytics")
public class AlcoholController {

    private final AlcoholService alcoholService;

    @PostMapping
    @Operation(summary = "Log an alcohol drink")
    public ResponseEntity<AlcoholLogResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AlcoholLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(alcoholService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all alcohol logs")
    public ResponseEntity<List<AlcoholLogResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(alcoholService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get alcohol logs with pagination, sorting, date filtering and drink type filter")
    public ResponseEntity<PageResponse<AlcoholLogResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "logDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) DrinkType drinkType) {
        return ResponseEntity.ok(alcoholService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo, drinkType));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific alcohol log")
    public ResponseEntity<AlcoholLogResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(alcoholService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an alcohol log")
    public ResponseEntity<AlcoholLogResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody AlcoholLogRequest request) {
        return ResponseEntity.ok(alcoholService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an alcohol log")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        alcoholService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get alcohol analytics (units/week, streak, monthly trend)")
    public ResponseEntity<AlcoholAnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(alcoholService.getAnalytics(principal.getId()));
    }
}
