package com.alex.workouttracker.workout.dto;

import com.alex.workouttracker.workout.model.WeightUnit;
import java.math.BigDecimal;

public record WorkoutEntryResponse(
    Long id,
    Long exerciseId,
    int sets,
    int reps,
    BigDecimal weight,
    WeightUnit unit,
    String notes,
    int position) {}
