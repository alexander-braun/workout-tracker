package com.alex.workouttracker.body.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MeasurementEntryResponse(
    Long id,
    LocalDate date,
    BigDecimal chest,
    BigDecimal waist,
    BigDecimal neck,
    BigDecimal bicepsLeft,
    BigDecimal bicepsRight,
    BigDecimal thighLeft,
    BigDecimal thighRight,
    BigDecimal calfLeft,
    BigDecimal calfRight) {

  public static MeasurementEntryResponse empty(LocalDate date) {
    return new MeasurementEntryResponse(
        null, date, null, null, null, null, null, null, null, null, null);
  }
}
