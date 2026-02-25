package com.optivita.entity;

import com.optivita.entity.enums.DrinkType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "alcohol_logs", indexes = {
        @Index(name = "idx_alcohol_logs_user_id", columnList = "user_id"),
        @Index(name = "idx_alcohol_logs_user_date", columnList = "user_id, log_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlcoholLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "drink_type", nullable = false, length = 20)
    private DrinkType drinkType;

    @Column(name = "custom_name", length = 200)
    private String customName;

    @Column(nullable = false)
    private Double units;

    @Column(name = "volume_ml")
    private Double volumeMl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
