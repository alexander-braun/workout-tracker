package com.alex.workouttracker.body.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.stream.Stream;

public record MeasurementEntryRequest(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal chest,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal waist,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal neck,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal weight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal bicepsLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal bicepsRight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal thighLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal thighRight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal calfLeft,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal calfRight) {

  public boolean isEmpty() {
    return Stream.of(
            chest,
            waist,
            neck,
            weight,
            bicepsLeft,
            bicepsRight,
            thighLeft,
            thighRight,
            calfLeft,
            calfRight)
        .allMatch(Objects::isNull);
  }
}
