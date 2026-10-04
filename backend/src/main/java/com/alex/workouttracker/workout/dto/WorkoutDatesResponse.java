package com.alex.workouttracker.workout.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkoutDatesResponse(
      List<LocalDate> dates) {
}
