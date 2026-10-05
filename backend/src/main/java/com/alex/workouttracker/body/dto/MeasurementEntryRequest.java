package com.alex.workouttracker.body.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.PositiveOrZero;

public record MeasurementEntryRequest(
      @PositiveOrZero BigDecimal chest,
      @PositiveOrZero BigDecimal waist,
      @PositiveOrZero BigDecimal neck,
      @PositiveOrZero BigDecimal bicepsLeft,
      @PositiveOrZero BigDecimal bicepsRight,
      @PositiveOrZero BigDecimal thighLeft,
      @PositiveOrZero BigDecimal thighRight,
      @PositiveOrZero BigDecimal calfLeft,
      @PositiveOrZero BigDecimal calfRight) {
}
