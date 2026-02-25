package com.optivita.repository;

import com.optivita.entity.MealPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MealPlanRepository extends JpaRepository<MealPlan, UUID> {

    List<MealPlan> findByUserIdOrderByWeekStartDateDesc(UUID userId);

    Page<MealPlan> findByUserId(UUID userId, Pageable pageable);

    Page<MealPlan> findByUserIdAndWeekStartDateBetween(UUID userId, LocalDate from, LocalDate to, Pageable pageable);

    Optional<MealPlan> findByIdAndUserId(UUID id, UUID userId);

    Optional<MealPlan> findByUserIdAndWeekStartDate(UUID userId, LocalDate weekStartDate);

    Optional<MealPlan> findFirstByUserIdOrderByWeekStartDateDesc(UUID userId);

    boolean existsByUserIdAndWeekStartDateBetween(UUID userId, LocalDate from, LocalDate to);
}
