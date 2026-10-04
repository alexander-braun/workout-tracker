
package com.alex.workouttracker.workout.dto;

import java.math.BigDecimal;

import com.alex.workouttracker.workout.WeightUnit;

public record WorkoutEntryResponse(
    Long id,
    Long exerciseId,
    int sets,
    int reps,
    BigDecimal weight,
    WeightUnit unit,
    String notes,
    int position
) {
}