package com.optivita.dto.alcohol;

import com.optivita.entity.enums.DrinkType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlcoholLogResponse {

    private UUID id;
    private LocalDate date;
    private DrinkType drinkType;
    private String customName;
    private Double units;
    private Double volumeMl;
    private String notes;
    private Instant createdAt;
}
