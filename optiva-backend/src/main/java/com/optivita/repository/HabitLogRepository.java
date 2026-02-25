package com.optivita.repository;

import com.optivita.entity.HabitLog;
import com.optivita.entity.enums.HabitLogStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HabitLogRepository extends JpaRepository<HabitLog, UUID> {

    List<HabitLog> findByHabitIdOrderByLogDateDesc(UUID habitId);

    Optional<HabitLog> findByHabitIdAndLogDate(UUID habitId, LocalDate logDate);

    @Query("SELECT hl FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.logDate >= :fromDate ORDER BY hl.logDate ASC")
    List<HabitLog> findByHabitIdAndDateFrom(@Param("habitId") UUID habitId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.logDate >= :fromDate AND hl.status = :status")
    long countByHabitIdAndDateFromAndStatus(@Param("habitId") UUID habitId, @Param("fromDate") LocalDate fromDate, @Param("status") HabitLogStatus status);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.id = :habitId AND hl.logDate >= :fromDate")
    long countByHabitIdAndDateFrom(@Param("habitId") UUID habitId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.user.id = :userId AND hl.logDate = :date AND hl.status = 'DONE'")
    long countDoneByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(hl) FROM HabitLog hl WHERE hl.habit.user.id = :userId AND hl.logDate = :date")
    long countByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
