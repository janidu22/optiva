package com.optivita.repository;

import com.optivita.entity.ProgressEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressEntryRepository extends JpaRepository<ProgressEntry, UUID> {

    List<ProgressEntry> findByProgramIdOrderByDateDesc(UUID programId);

    List<ProgressEntry> findByProgramIdAndDateBetweenOrderByDateAsc(UUID programId, LocalDate from, LocalDate to);

    Optional<ProgressEntry> findByIdAndProgramId(UUID id, UUID programId);

    /** Used by the evaluation engine: latest N entries before a given date. */
    List<ProgressEntry> findTop4ByProgramIdAndDateBeforeOrderByDateDesc(UUID programId, LocalDate before);
}
