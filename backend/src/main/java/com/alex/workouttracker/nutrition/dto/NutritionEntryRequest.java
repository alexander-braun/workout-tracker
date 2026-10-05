package com.alex.workouttracker.nutrition.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record NutritionEntryRequest(
    @PositiveOrZero BigDecimal calories,
    @PositiveOrZero BigDecimal protein,
    @PositiveOrZero BigDecimal sleepHours,
    @PositiveOrZero Integer steps,
    @Min(1) @Max(5) Integer sleepQuality,
    @Min(1) @Max(5) Integer energy,
    @Size(max = 1000) String notes) {}
