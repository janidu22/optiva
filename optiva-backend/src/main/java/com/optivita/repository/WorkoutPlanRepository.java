package com.optivita.repository;

import com.optivita.entity.WorkoutPlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, UUID> {

    List<WorkoutPlan> findByUserIdOrderByWeekStartDateDesc(UUID userId);

    Page<WorkoutPlan> findByUserId(UUID userId, Pageable pageable);

    Page<WorkoutPlan> findByUserIdAndWeekStartDateBetween(UUID userId, LocalDate from, LocalDate to, Pageable pageable);

    Optional<WorkoutPlan> findByIdAndUserId(UUID id, UUID userId);

    Optional<WorkoutPlan> findByUserIdAndWeekStartDate(UUID userId, LocalDate weekStartDate);

    Optional<WorkoutPlan> findFirstByUserIdOrderByWeekStartDateDesc(UUID userId);

    boolean existsByUserIdAndWeekStartDateBetween(UUID userId, LocalDate from, LocalDate to);
}
