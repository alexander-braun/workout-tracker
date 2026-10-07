package com.alex.workouttracker.nutrition.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record NutritionEntryResponse(
    UUID id,
    LocalDate date,
    BigDecimal calories,
    BigDecimal protein,
    BigDecimal sleepHours,
    Integer steps,
    Integer sleepQuality,
    Integer energy,
    String notes) {

  public static NutritionEntryResponse empty(LocalDate date) {
    return new NutritionEntryResponse(null, date, null, null, null, null, null, null, null);
  }
}
