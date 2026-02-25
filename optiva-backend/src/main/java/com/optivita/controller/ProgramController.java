package com.optivita.controller;

import com.optivita.dto.program.*;
import com.optivita.security.UserPrincipal;
import com.optivita.service.ProgramService;
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
@RequestMapping("/v1/programs")
@RequiredArgsConstructor
@Tag(name = "Programs & Checkpoints", description = "Manage transformation programs, milestones, and progress tracking")
public class ProgramController {

    private final ProgramService programService;

    // â”€â”€ Program CRUD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @PostMapping
    @Operation(summary = "Create a 12-month program with 5 auto-generated milestone checkpoints")
    public ResponseEntity<ProgramResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ProgramRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(programService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all programs for the current user")
    public ResponseEntity<List<ProgramResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(programService.getAllByUser(principal.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific program with its checkpoints")
    public ResponseEntity<ProgramResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(programService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update program notes / dates. Does NOT auto-shift checkpoints â€” call /regenerate explicitly.")
    public ResponseEntity<ProgramResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody ProgramRequest request) {
        return ResponseEntity.ok(programService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a program and all its data (checkpoints, progress entries)")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        programService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    // â”€â”€ Checkpoint operations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @PatchMapping("/{programId}/checkpoints/{checkpointId}")
    @Operation(summary = "Update a checkpoint (status, phase, focusTags, targetMetrics, notes)")
    public ResponseEntity<CheckpointResponse> updateCheckpoint(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId,
            @PathVariable UUID checkpointId,
            @RequestBody CheckpointUpdateRequest request) {
        return ResponseEntity.ok(
                programService.updateCheckpoint(principal.getId(), programId, checkpointId, request));
    }

    @PostMapping("/{programId}/checkpoints/regenerate")
    @Operation(summary = "Delete all checkpoints and regenerate the 5 standard milestones from the current startDate")
    public ResponseEntity<List<CheckpointResponse>> regenerateCheckpoints(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId) {
        return ResponseEntity.ok(programService.regenerateCheckpoints(principal.getId(), programId));
    }

    @PostMapping("/{programId}/checkpoints/{checkpointId}/evaluate")
    @Operation(summary = "Evaluate a checkpoint by comparing recent progress entries against targetMetrics")
    public ResponseEntity<CheckpointEvaluationResponse> evaluateCheckpoint(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId,
            @PathVariable UUID checkpointId) {
        return ResponseEntity.ok(
                programService.evaluateCheckpoint(principal.getId(), programId, checkpointId));
    }

    // â”€â”€ Progress entries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @PostMapping("/{programId}/progress")
    @Operation(summary = "Log a progress snapshot for this program")
    public ResponseEntity<ProgressEntryResponse> addProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId,
            @Valid @RequestBody ProgressEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(programService.addProgressEntry(principal.getId(), programId, request));
    }

    @GetMapping("/{programId}/progress")
    @Operation(summary = "Get all progress entries, optionally filtered by date range")
    public ResponseEntity<List<ProgressEntryResponse>> getProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(
                programService.getProgressEntries(principal.getId(), programId, from, to));
    }

    @DeleteMapping("/{programId}/progress/{entryId}")
    @Operation(summary = "Delete a progress entry")
    public ResponseEntity<Void> deleteProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID programId,
            @PathVariable UUID entryId) {
        programService.deleteProgressEntry(principal.getId(), programId, entryId);
        return ResponseEntity.noContent().build();
    }
}
