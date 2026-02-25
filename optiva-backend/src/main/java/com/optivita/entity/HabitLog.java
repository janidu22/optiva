package com.optivita.entity;

import com.optivita.entity.enums.HabitLogStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "habit_logs", indexes = {
        @Index(name = "idx_habit_logs_habit_id", columnList = "habit_id"),
        @Index(name = "idx_habit_logs_habit_date", columnList = "habit_id, log_date")
},
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_habit_logs_habit_date", columnNames = {"habit_id", "log_date"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HabitLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private HabitLogStatus status;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
