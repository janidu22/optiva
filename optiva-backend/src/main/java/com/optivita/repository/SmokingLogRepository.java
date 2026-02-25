package com.optivita.repository;

import com.optivita.entity.SmokingLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SmokingLogRepository extends JpaRepository<SmokingLog, UUID> {

    List<SmokingLog> findByUserIdOrderByLogDateDesc(UUID userId);

    Page<SmokingLog> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT s FROM SmokingLog s WHERE s.user.id = :userId AND s.logDate BETWEEN :from AND :to")
    Page<SmokingLog> findByUserIdAndLogDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    Optional<SmokingLog> findByIdAndUserId(UUID id, UUID userId);

    Optional<SmokingLog> findByUserIdAndLogDate(UUID userId, LocalDate logDate);

    @Query("SELECT s FROM SmokingLog s WHERE s.user.id = :userId AND s.logDate BETWEEN :from AND :to ORDER BY s.logDate ASC")
    List<SmokingLog> findByUserIdAndDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT s FROM SmokingLog s WHERE s.user.id = :userId AND s.smokeFree = true ORDER BY s.logDate DESC")
    List<SmokingLog> findSmokeFreeByUserIdDesc(@Param("userId") UUID userId);

    @Query("SELECT COUNT(s) > 0 FROM SmokingLog s WHERE s.user.id = :userId AND s.logDate = :date")
    boolean existsByUserIdAndLogDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
