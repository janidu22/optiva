package com.optivita.service;

import com.optivita.dto.PageResponse;
import com.optivita.dto.meal.*;
import com.optivita.entity.*;
import com.optivita.exception.BadRequestException;
import com.optivita.exception.ResourceNotFoundException;
import com.optivita.repository.MealPlanRepository;
import com.optivita.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public MealPlanResponse create(UUID userId, MealPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (mealPlanRepository.findByUserIdAndWeekStartDate(userId, request.getWeekStartDate()).isPresent()) {
            throw new BadRequestException("Meal plan already exists for week starting: " + request.getWeekStartDate());
        }

        MealPlan plan = MealPlan.builder()
                .user(user)
                .weekStartDate(request.getWeekStartDate())
                .build();

        if (request.getDays() != null) {
            for (MealPlanDayRequest dayReq : request.getDays()) {
                MealPlanDay day = MealPlanDay.builder()
                        .mealPlan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .build();

                if (dayReq.getMeals() != null) {
                    for (MealRequest mealReq : dayReq.getMeals()) {
                        Meal meal = Meal.builder()
                                .mealPlanDay(day)
                                .mealType(mealReq.getMealType())
                                .build();

                        if (mealReq.getItems() != null) {
                            for (MealItemRequest itemReq : mealReq.getItems()) {
                                MealItem item = MealItem.builder()
                                        .meal(meal)
                                        .name(itemReq.getName())
                                        .portion(itemReq.getPortion())
                                        .calories(itemReq.getCalories())
                                        .proteinG(itemReq.getProteinG())
                                        .carbsG(itemReq.getCarbsG())
                                        .fatG(itemReq.getFatG())
                                        .build();
                                meal.getItems().add(item);
                            }
                        }
                        day.getMeals().add(meal);
                    }
                }
                plan.getDays().add(day);
            }
        }

        return mapToResponse(mealPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public List<MealPlanResponse> getAll(UUID userId) {
        return mealPlanRepository.findByUserIdOrderByWeekStartDateDesc(userId)
                .stream().map(this::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<MealPlanResponse> getAllPaged(UUID userId, int page, int size,
                                                      String sortBy, String sortDir,
                                                      LocalDate dateFrom, LocalDate dateTo) {
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "weekStartDate");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<MealPlan> result;
        if (dateFrom != null && dateTo != null) {
            result = mealPlanRepository.findByUserIdAndWeekStartDateBetween(userId, dateFrom, dateTo, pageable);
        } else {
            result = mealPlanRepository.findByUserId(userId, pageable);
        }

        return PageResponse.<MealPlanResponse>builder()
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
    public MealPlanResponse getById(UUID userId, UUID planId) {
        MealPlan plan = mealPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan", "id", planId));
        return mapToResponse(plan);
    }

    @Transactional
    public MealPlanResponse update(UUID userId, UUID planId, MealPlanRequest request) {
        MealPlan plan = mealPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan", "id", planId));

        // Clear and rebuild days
        plan.getDays().clear();

        if (request.getDays() != null) {
            for (MealPlanDayRequest dayReq : request.getDays()) {
                MealPlanDay day = MealPlanDay.builder()
                        .mealPlan(plan)
                        .dayOfWeek(dayReq.getDayOfWeek())
                        .build();

                if (dayReq.getMeals() != null) {
                    for (MealRequest mealReq : dayReq.getMeals()) {
                        Meal meal = Meal.builder()
                                .mealPlanDay(day)
                                .mealType(mealReq.getMealType())
                                .build();

                        if (mealReq.getItems() != null) {
                            for (MealItemRequest itemReq : mealReq.getItems()) {
                                MealItem item = MealItem.builder()
                                        .meal(meal)
                                        .name(itemReq.getName())
                                        .portion(itemReq.getPortion())
                                        .calories(itemReq.getCalories())
                                        .proteinG(itemReq.getProteinG())
                                        .carbsG(itemReq.getCarbsG())
                                        .fatG(itemReq.getFatG())
                                        .build();
                                meal.getItems().add(item);
                            }
                        }
                        day.getMeals().add(meal);
                    }
                }
                plan.getDays().add(day);
            }
        }

        return mapToResponse(mealPlanRepository.save(plan));
    }

    @Transactional
    public void delete(UUID userId, UUID planId) {
        MealPlan plan = mealPlanRepository.findByIdAndUserId(planId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("MealPlan", "id", planId));
        mealPlanRepository.delete(plan);
    }

    @Transactional
    public MealPlanResponse copyLastWeek(UUID userId, LocalDate newWeekStartDate) {
        if (mealPlanRepository.findByUserIdAndWeekStartDate(userId, newWeekStartDate).isPresent()) {
            throw new BadRequestException("Meal plan already exists for week starting: " + newWeekStartDate);
        }

        MealPlan lastPlan = mealPlanRepository.findFirstByUserIdOrderByWeekStartDateDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No previous meal plan found to copy"));

        User user = lastPlan.getUser();
        MealPlan newPlan = MealPlan.builder()
                .user(user)
                .weekStartDate(newWeekStartDate)
                .build();

        for (MealPlanDay srcDay : lastPlan.getDays()) {
            MealPlanDay newDay = MealPlanDay.builder()
                    .mealPlan(newPlan)
                    .dayOfWeek(srcDay.getDayOfWeek())
                    .build();

            for (Meal srcMeal : srcDay.getMeals()) {
                Meal newMeal = Meal.builder()
                        .mealPlanDay(newDay)
                        .mealType(srcMeal.getMealType())
                        .build();

                for (MealItem srcItem : srcMeal.getItems()) {
                    MealItem newItem = MealItem.builder()
                            .meal(newMeal)
                            .name(srcItem.getName())
                            .portion(srcItem.getPortion())
                            .calories(srcItem.getCalories())
                            .proteinG(srcItem.getProteinG())
                            .carbsG(srcItem.getCarbsG())
                            .fatG(srcItem.getFatG())
                            .build();
                    newMeal.getItems().add(newItem);
                }
                newDay.getMeals().add(newMeal);
            }
            newPlan.getDays().add(newDay);
        }

        return mapToResponse(mealPlanRepository.save(newPlan));
    }

    private MealPlanResponse mapToResponse(MealPlan plan) {
        List<MealPlanResponse.DayResponse> days = plan.getDays().stream().map(day -> {
            List<MealPlanResponse.MealResponse> meals = day.getMeals().stream().map(meal -> {
                List<MealPlanResponse.ItemResponse> items = meal.getItems().stream().map(item ->
                        MealPlanResponse.ItemResponse.builder()
                                .id(item.getId())
                                .name(item.getName())
                                .portion(item.getPortion())
                                .calories(item.getCalories())
                                .proteinG(item.getProteinG())
                                .carbsG(item.getCarbsG())
                                .fatG(item.getFatG())
                                .build()
                ).toList();

                return MealPlanResponse.MealResponse.builder()
                        .id(meal.getId())
                        .mealType(meal.getMealType())
                        .items(items)
                        .build();
            }).toList();

            return MealPlanResponse.DayResponse.builder()
                    .id(day.getId())
                    .dayOfWeek(day.getDayOfWeek())
                    .meals(meals)
                    .build();
        }).toList();

        return MealPlanResponse.builder()
                .id(plan.getId())
                .weekStartDate(plan.getWeekStartDate())
                .days(days)
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}
