package com.alex.workouttracker.workout.dto;

import com.alex.workouttracker.workout.model.WeightUnit;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.UUID;

public record WorkoutEntryRequest(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) UUID exerciseId,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) String newExerciseName,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) @Min(0) int sets,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) @Min(0) int reps,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal weight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) @NotNull WeightUnit unit,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @Size(max = 1000)
        String notes,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int position) {}
