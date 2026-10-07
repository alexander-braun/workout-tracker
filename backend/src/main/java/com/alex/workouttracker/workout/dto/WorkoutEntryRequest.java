package com.alex.workouttracker.workout.dto;

import com.alex.workouttracker.workout.model.WeightUnit;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record WorkoutEntryRequest(
    UUID exerciseId,
    String newExerciseName,
    @Min(0) int sets,
    @Min(0) int reps,
    BigDecimal weight,
    @NotNull WeightUnit unit,
    @Size(max = 1000) String notes,
    int position) {}
