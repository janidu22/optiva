package com.optivita.repository;

import com.optivita.entity.AlcoholLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlcoholLogRepository extends JpaRepository<AlcoholLog, UUID> {

    List<AlcoholLog> findByUserIdOrderByLogDateDesc(UUID userId);

    Page<AlcoholLog> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT a FROM AlcoholLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :from AND :to")
    Page<AlcoholLog> findByUserIdAndLogDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    @Query("SELECT a FROM AlcoholLog a WHERE a.user.id = :userId AND a.drinkType = :drinkType")
    Page<AlcoholLog> findByUserIdAndDrinkType(@Param("userId") UUID userId, @Param("drinkType") com.optivita.entity.enums.DrinkType drinkType, Pageable pageable);

    @Query("SELECT a FROM AlcoholLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :from AND :to AND a.drinkType = :drinkType")
    Page<AlcoholLog> findByUserIdAndDateBetweenAndDrinkType(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("drinkType") com.optivita.entity.enums.DrinkType drinkType, Pageable pageable);

    Optional<AlcoholLog> findByIdAndUserId(UUID id, UUID userId);

    @Query("SELECT a FROM AlcoholLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :from AND :to ORDER BY a.logDate ASC")
    List<AlcoholLog> findByUserIdAndDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("SELECT COUNT(a) > 0 FROM AlcoholLog a WHERE a.user.id = :userId AND a.logDate = :date")
    boolean existsByUserIdAndLogDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(a.units), 0) FROM AlcoholLog a WHERE a.user.id = :userId AND a.logDate BETWEEN :from AND :to")
    Double sumUnitsByUserIdAndDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to);
}
