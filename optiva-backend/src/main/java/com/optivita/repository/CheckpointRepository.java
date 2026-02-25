package com.optivita.repository;

import com.optivita.entity.Checkpoint;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CheckpointRepository extends JpaRepository<Checkpoint, UUID> {

    List<Checkpoint> findByProgramIdOrderByCheckpointDateAsc(UUID programId);

    Optional<Checkpoint> findByIdAndProgramId(UUID id, UUID programId);
}
