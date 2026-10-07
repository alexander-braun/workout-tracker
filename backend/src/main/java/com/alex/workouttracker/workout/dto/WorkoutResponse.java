package com.alex.workouttracker.workout.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WorkoutResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) UUID id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) LocalDate date,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<WorkoutEntryResponse> entries) {

  public static WorkoutResponse empty(LocalDate date) {
    return new WorkoutResponse(null, date, List.of());
  }
}
