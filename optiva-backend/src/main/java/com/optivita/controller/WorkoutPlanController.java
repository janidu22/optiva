package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.workout.WorkoutPlanRequest;
import com.optivita.dto.workout.WorkoutPlanResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.WorkoutPlanService;
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
@RequestMapping("/v1/workout-plans")
@RequiredArgsConstructor
@Tag(name = "Workout Planning", description = "Weekly workout planning")
public class WorkoutPlanController {

    private final WorkoutPlanService workoutPlanService;

    @PostMapping
    @Operation(summary = "Create a new weekly workout plan")
    public ResponseEntity<WorkoutPlanResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody WorkoutPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workoutPlanService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all workout plans")
    public ResponseEntity<List<WorkoutPlanResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(workoutPlanService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get workout plans with pagination, sorting and date filtering")
    public ResponseEntity<PageResponse<WorkoutPlanResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "weekStartDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(workoutPlanService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific workout plan")
    public ResponseEntity<WorkoutPlanResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(workoutPlanService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a workout plan (replaces all days/sessions/exercises)")
    public ResponseEntity<WorkoutPlanResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody WorkoutPlanRequest request) {
        return ResponseEntity.ok(workoutPlanService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a workout plan")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        workoutPlanService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
