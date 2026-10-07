package com.alex.workouttracker.nutrition.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record NutritionEntryResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) UUID id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate date,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal calories,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal protein,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal sleepHours,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) Integer steps,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) Integer sleepQuality,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) Integer energy,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) String notes) {

  public static NutritionEntryResponse empty(LocalDate date) {
    return new NutritionEntryResponse(null, date, null, null, null, null, null, null, null);
  }
}
