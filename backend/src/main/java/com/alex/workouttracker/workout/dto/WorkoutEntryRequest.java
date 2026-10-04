
package com.alex.workouttracker.workout.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

import com.alex.workouttracker.workout.model.WeightUnit;

public record WorkoutEntryRequest(
      Long exerciseId,
      String newExerciseName,

      @Min(0) int sets,

      @Min(0) int reps,

      BigDecimal weight,

      @NotNull WeightUnit unit,

      String notes,

      int position) {
}