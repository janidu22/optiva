package com.optivita.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "journal_entries", indexes = {
        @Index(name = "idx_journal_entries_user_id", columnList = "user_id"),
        @Index(name = "idx_journal_entries_user_date", columnList = "user_id, entry_date")
},
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_journal_entries_user_date", columnNames = {"user_id", "entry_date"})
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JournalEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "ate_notes", columnDefinition = "TEXT")
    private String ateNotes;

    @Column(length = 500)
    private String tags; // comma-separated

    private Integer mood; // 1-10

    @Column(columnDefinition = "TEXT")
    private String emotions;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private Integer energy; // 1-10

    @Column(name = "sleep_hours")
    private Double sleepHours;

    private Integer stress; // 1-10

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    @Version
    private Integer version;
}
