package com.alex.workouttracker.workout.dto;

import com.alex.workouttracker.workout.model.WeightUnit;
import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;
import java.util.UUID;

public record WorkoutEntryResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID exerciseId,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int sets,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int reps,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) BigDecimal weight,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) WeightUnit unit,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) String notes,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) int position) {}
