package com.optivita.repository;

import com.optivita.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitRepository extends JpaRepository<Habit, UUID> {

    List<Habit> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Habit> findByUserIdAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);

    Optional<Habit> findByIdAndUserId(UUID id, UUID userId);
}
