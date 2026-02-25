package com.optivita.controller;

import com.optivita.dto.habit.*;
import com.optivita.security.UserPrincipal;
import com.optivita.service.HabitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/habits")
@RequiredArgsConstructor
@Tag(name = "Habits", description = "Manage habits and daily logs with analytics")
public class HabitController {

    private final HabitService habitService;

    @PostMapping
    @Operation(summary = "Create a new habit")
    public ResponseEntity<HabitResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HabitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitService.createHabit(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all habits")
    public ResponseEntity<List<HabitResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(habitService.getAllHabits(principal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific habit")
    public ResponseEntity<HabitResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(habitService.getHabitById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a habit")
    public ResponseEntity<HabitResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody HabitRequest request) {
        return ResponseEntity.ok(habitService.updateHabit(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a habit and its logs")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        habitService.deleteHabit(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // ---- Logs ----

    @PostMapping("/{habitId}/logs")
    @Operation(summary = "Log a habit for a date (upsert)")
    public ResponseEntity<HabitLogResponse> log(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID habitId,
            @Valid @RequestBody HabitLogRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(habitService.logHabit(principal.getId(), habitId, request));
    }

    @GetMapping("/{habitId}/logs")
    @Operation(summary = "Get all logs for a habit")
    public ResponseEntity<List<HabitLogResponse>> getLogs(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID habitId) {
        return ResponseEntity.ok(habitService.getHabitLogs(principal.getId(), habitId));
    }

    // ---- Analytics ----

    @GetMapping("/{habitId}/analytics")
    @Operation(summary = "Get analytics for a habit (streak, adherence)")
    public ResponseEntity<HabitAnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID habitId) {
        return ResponseEntity.ok(habitService.getAnalytics(principal.getId(), habitId));
    }
}
