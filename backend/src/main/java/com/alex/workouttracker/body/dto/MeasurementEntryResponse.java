package com.alex.workouttracker.body.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record MeasurementEntryResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) UUID id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate date,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal chest,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal waist,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal neck,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal bicepsLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal bicepsRight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal thighLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal thighRight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal calfLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal calfRight) {

  public static MeasurementEntryResponse empty(LocalDate date) {
    return new MeasurementEntryResponse(
        null, date, null, null, null, null, null, null, null, null, null);
  }
}
