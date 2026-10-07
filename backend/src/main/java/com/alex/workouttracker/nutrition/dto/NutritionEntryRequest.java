package com.alex.workouttracker.nutrition.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record NutritionEntryRequest(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal calories,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal protein,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        BigDecimal sleepHours,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @PositiveOrZero
        Integer steps,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @Min(1) @Max(5)
        Integer sleepQuality,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @Min(1) @Max(5)
        Integer energy,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED, nullable = true) @Size(max = 1000)
        String notes) {}
