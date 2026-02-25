package com.optivita.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "exercises", indexes = {
        @Index(name = "idx_exercises_session_id", columnList = "workout_session_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exercise {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_session_id", nullable = false)
    private WorkoutSession workoutSession;

    @Column(nullable = false, length = 200)
    private String name;

    private Integer sets;

    private Integer reps;

    @Column(name = "duration_min")
    private Double duration;

    @Column(name = "weight_kg")
    private Double weight;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
