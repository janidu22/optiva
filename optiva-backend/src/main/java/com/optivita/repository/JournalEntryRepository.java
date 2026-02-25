package com.optivita.repository;

import com.optivita.entity.JournalEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, UUID> {

    List<JournalEntry> findByUserIdOrderByEntryDateDesc(UUID userId);

    Page<JournalEntry> findByUserId(UUID userId, Pageable pageable);

    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND j.entryDate BETWEEN :from AND :to")
    Page<JournalEntry> findByUserIdAndEntryDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, Pageable pageable);

    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND (LOWER(j.notes) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.tags) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.emotions) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<JournalEntry> searchByUserId(@Param("userId") UUID userId, @Param("q") String query, Pageable pageable);

    @Query("SELECT j FROM JournalEntry j WHERE j.user.id = :userId AND j.entryDate BETWEEN :from AND :to AND (LOWER(j.notes) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.tags) LIKE LOWER(CONCAT('%',:q,'%')) OR LOWER(j.emotions) LIKE LOWER(CONCAT('%',:q,'%')))")
    Page<JournalEntry> searchByUserIdAndDateBetween(@Param("userId") UUID userId, @Param("from") LocalDate from, @Param("to") LocalDate to, @Param("q") String query, Pageable pageable);

    Optional<JournalEntry> findByIdAndUserId(UUID id, UUID userId);

    Optional<JournalEntry> findByUserIdAndEntryDate(UUID userId, LocalDate entryDate);

    @Query("SELECT COUNT(j) > 0 FROM JournalEntry j WHERE j.user.id = :userId AND j.entryDate = :date")
    boolean existsByUserIdAndEntryDate(@Param("userId") UUID userId, @Param("date") LocalDate date);
}
