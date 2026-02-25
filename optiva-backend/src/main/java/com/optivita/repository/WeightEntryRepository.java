package com.optivita.repository;

import com.optivita.entity.WeightEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, UUID> {

    List<WeightEntry> findByUserIdOrderByEntryDateDesc(UUID userId);

    Page<WeightEntry> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT w FROM WeightEntry w WHERE w.user.id = :userId AND w.entryDate BETWEEN :from AND :to")
    Page<WeightEntry> findByUserIdAndEntryDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    Optional<WeightEntry> findByIdAndUserId(UUID id, UUID userId);

    Optional<WeightEntry> findFirstByUserIdOrderByEntryDateDesc(UUID userId);

    Optional<WeightEntry> findFirstByUserIdOrderByEntryDateAsc(UUID userId);

    @Query("SELECT w FROM WeightEntry w WHERE w.user.id = :userId AND w.entryDate >= :fromDate ORDER BY w.entryDate ASC")
    List<WeightEntry> findByUserIdAndDateFrom(@Param("userId") UUID userId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT w FROM WeightEntry w WHERE w.user.id = :userId AND w.entryDate BETWEEN :fromDate AND :toDate ORDER BY w.entryDate ASC")
    List<WeightEntry> findByUserIdAndDateBetween(@Param("userId") UUID userId, @Param("fromDate") LocalDate fromDate, @Param("toDate") LocalDate toDate);

    @Query("SELECT COUNT(w) > 0 FROM WeightEntry w WHERE w.user.id = :userId AND w.entryDate = :date")
    boolean existsByUserIdAndEntryDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
