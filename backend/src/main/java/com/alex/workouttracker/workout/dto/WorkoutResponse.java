package com.alex.workouttracker.workout.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record WorkoutResponse(UUID id, LocalDate date, List<WorkoutEntryResponse> entries) {

  public static WorkoutResponse empty(LocalDate date) {
    return new WorkoutResponse(null, date, List.of());
  }
}
