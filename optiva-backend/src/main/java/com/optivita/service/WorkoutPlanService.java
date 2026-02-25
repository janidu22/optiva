package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.workout.*;
import com.optivita.entity.*;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.UserRepository;
import com.optivita.repository.WorkoutPlanRepository;
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
public class WorkoutPlanService {

    private final WorkoutPlanRepository workoutPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public WorkoutPlanResponse create(UUID userId, WorkoutPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (workoutPlanRepository.findByUserIdAndWeekStartDate(userId, request.getWeekStartDate()).isPresent()) {
            throw new BadRequestException("Workout plan already exists for week starting: " + request.getWeekStartDate());
        }

        WorkoutPlan plan = WorkoutPlan.builder()
                .user(user)
                .weekStartDate(request.getWeekStartDate())
                .build();

        if (request.getDays() != null) {
            for (WorkoutDayRequest dayReq : request.getDays()) {
                WorkoutPlanDay day = WorkoutPlanDay.builder()
                        .workoutPlan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .build();

                if (dayReq.getSessions() != null) {
                    for (WorkoutSessionRequest sessionReq : dayReq.getSessions()) {
                        WorkoutSession session = WorkoutSession.builder()
                                .workoutPlanDay(day)
                                .name(sessionReq.getName())
                                .orderIndex(sessionReq.getOrderIndex())
                                .build();

                        if (sessionReq.getExercises() != null) {
                            for (ExerciseRequest exReq : sessionReq.getExercises()) {
                                Exercise exercise = Exercise.builder()
                                        .workoutSession(session)
                                        .name(exReq.getName())
                                        .sets(exReq.getSets())
                                        .reps(exReq.getReps())
                                        .duration(exReq.getDuration())
                                        .weight(exReq.getWeight())
                                        .orderIndex(exReq.getOrderIndex())
                                        .build();
                                session.getExercises().add(exercise);
                            }
                        }
                        day.getSessions().add(session);
                    }
                }
                plan.getDays().add(day);
            }
        }

        return mapToResponse(workoutPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public List<WorkoutPlanResponse> getAll(UUID userId) {
        return workoutPlanRepository.findByUserIdOrderByWeekStartDateDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<WorkoutPlanResponse> getAllPaged(UUID userId, int page, int size,
                                                         String sortBy, String sortDir,
                                                         LocalDate dateFrom, LocalDate dateTo) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "weekStartDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<WorkoutPlan> result;
        if (dateFrom != null && dateTo != null) {
            result = workoutPlanRepository.findByUserIdAndWeekStartDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = workoutPlanRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<WorkoutPlanResponse>builder()
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
    public WorkoutPlanResponse getById(UUID userId, UUID planId) {
        WorkoutPlan plan = workoutPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));
        return mapToResponse(plan);
    }

    @Transactional
    public WorkoutPlanResponse update(UUID userId, UUID planId, WorkoutPlanRequest request) {
        WorkoutPlan plan = workoutPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));

        plan.getDays().clear();

        if (request.getDays() != null) {
            for (WorkoutDayRequest dayReq : request.getDays()) {
                WorkoutPlanDay day = WorkoutPlanDay.builder()
                        .workoutPlan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .build();

                if (dayReq.getSessions() != null) {
                    for (WorkoutSessionRequest sessionReq : dayReq.getSessions()) {
                        WorkoutSession session = WorkoutSession.builder()
                                .workoutPlanDay(day)
                                .name(sessionReq.getName())
                                .orderIndex(sessionReq.getOrderIndex())
                                .build();

                        if (sessionReq.getExercises() != null) {
                            for (ExerciseRequest exReq : sessionReq.getExercises()) {
                                Exercise exercise = Exercise.builder()
                                        .workoutSession(session)
                                        .name(exReq.getName())
                                        .sets(exReq.getSets())
                                        .reps(exReq.getReps())
                                        .duration(exReq.getDuration())
                                        .weight(exReq.getWeight())
                                        .orderIndex(exReq.getOrderIndex())
                                        .build();
                                session.getExercises().add(exercise);
                            }
                        }
                        day.getSessions().add(session);
                    }
                }
                plan.getDays().add(day);
            }
        }

        return mapToResponse(workoutPlanRepository.save(plan));
    }

    @Transactional
    public void delete(UUID userId, UUID planId) {
        WorkoutPlan plan = workoutPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkoutPlan", "id", planId));
        workoutPlanRepository.delete(plan);
    }

    private WorkoutPlanResponse mapToResponse(WorkoutPlan plan) {
        List<WorkoutPlanResponse.DayResponse> days = plan.getDays().stream().map(day -> {
            List<WorkoutPlanResponse.SessionResponse> sessions = day.getSessions().stream().map(session -> {
                List<WorkoutPlanResponse.ExerciseResponse> exercises = session.getExercises().stream().map(ex ->
                        WorkoutPlanResponse.ExerciseResponse.builder()
                                .id(ex.getId())
                                .name(ex.getName())
                                .sets(ex.getSets())
                                .reps(ex.getReps())
                                .duration(ex.getDuration())
                                .weight(ex.getWeight())
                                .orderIndex(ex.getOrderIndex())
                                .build()
                ).toList();

                return WorkoutPlanResponse.SessionResponse.builder()
                        .id(session.getId())
                        .name(session.getName())
                        .orderIndex(session.getOrderIndex())
                        .exercises(exercises)
                        .build();
            }).toList();

            return WorkoutPlanResponse.DayResponse.builder()
                    .id(day.getId())
                    .dayOfWeek(day.getDayOfWeek())
                    .sessions(sessions)
                    .build();
        }).toList();

        return WorkoutPlanResponse.builder()
                .id(plan.getId())
                .weekStartDate(plan.getWeekStartDate())
                .days(days)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
