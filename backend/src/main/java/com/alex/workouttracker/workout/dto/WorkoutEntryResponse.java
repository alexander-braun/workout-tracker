package com.alex.workouttracker.workout.dto;

import com.alex.workouttracker.workout.model.WeightUnit;
import java.math.BigDecimal;
import java.util.UUID;

public record WorkoutEntryResponse(
    UUID id,
    UUID exerciseId,
    int sets,
    int reps,
    BigDecimal weight,
    WeightUnit unit,
    String notes,
    int position) {}
