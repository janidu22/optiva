package com.optivita.controller;

import com.optivita.dto.PageResponse;
import com.optivita.dto.meal.MealPlanRequest;
import com.optivita.dto.meal.MealPlanResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.MealPlanService;
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
@RequestMapping("/v1/meal-plans")
@RequiredArgsConstructor
@Tag(name = "Meal Planning", description = "Weekly meal planning")
public class MealPlanController {

    private final MealPlanService mealPlanService;

    @PostMapping
    @Operation(summary = "Create a new weekly meal plan")
    public ResponseEntity<MealPlanResponse> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody MealPlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealPlanService.create(principal.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get all meal plans")
    public ResponseEntity<List<MealPlanResponse>> getAll(@AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(mealPlanService.getAll(principal.getId()));
    }

    @GetMapping("/paged")
    @Operation(summary = "Get meal plans with pagination, sorting and date filtering")
    public ResponseEntity<PageResponse<MealPlanResponse>> getAllPaged(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "weekStartDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        return ResponseEntity.ok(mealPlanService.getAllPaged(principal.getId(), page, size, sortBy, sortDir, dateFrom, dateTo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a specific meal plan")
    public ResponseEntity<MealPlanResponse> getById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        return ResponseEntity.ok(mealPlanService.getById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a meal plan (replaces all days/meals/items)")
    public ResponseEntity<MealPlanResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id,
            @Valid @RequestBody MealPlanRequest request) {
        return ResponseEntity.ok(mealPlanService.update(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a meal plan")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable UUID id) {
        mealPlanService.delete(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/copy-last-week")
    @Operation(summary = "Copy last week's meal plan to a new week")
    public ResponseEntity<MealPlanResponse> copyLastWeek(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mealPlanService.copyLastWeek(principal.getId(), weekStartDate));
    }
}
