package com.optivita.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "smoking_logs", indexes = {
        @Index(name = "idx_smoking_logs_user_id", columnList = "user_id"),
        @Index(name = "idx_smoking_logs_user_date", columnList = "user_id, log_date")
},
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_smoking_logs_user_date", columnNames = {"user_id", "log_date"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SmokingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "cigarettes_count")
    private Integer cigarettesCount;

    @Column(name = "smoke_free", nullable = false)
    @Builder.Default
    private Boolean smokeFree = false;

    private Integer cravings; // 1-10

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    private Integer version;
}
