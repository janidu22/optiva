package com.optivita.repository;

import com.optivita.entity.Program;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgramRepository extends JpaRepository<Program, UUID> {

    List<Program> findByUserIdOrderByStartDateDesc(UUID userId);

    Optional<Program> findByIdAndUserId(UUID id, UUID userId);
}
