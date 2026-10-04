package com.alex.workouttracker.bodylog.dto;

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
}
