package com.optivita.controller;

import com.optivita.dto.calendar.CalendarResponse;
import com.optivita.security.UserPrincipal;
import com.optivita.service.CalendarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/v1/calendar")
@RequiredArgsConstructor
@Tag(name = "Calendar", description = "Calendar aggregation endpoint")
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    @Operation(summary = "Get calendar data with flags for each day in range")
    public ResponseEntity<CalendarResponse> getCalendar(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(calendarService.getCalendar(principal.getId(), from, to));
    }
}
