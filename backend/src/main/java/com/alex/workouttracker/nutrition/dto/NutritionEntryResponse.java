package com.alex.workouttracker.nutrition.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record NutritionEntryResponse(
    Long id,
    LocalDate date,
    BigDecimal calories,
    BigDecimal protein,
    BigDecimal sleepHours,
    Integer steps,
    Integer sleepQuality,
    Integer energy,
    String notes) {}
