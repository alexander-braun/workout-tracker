package com.alex.workouttracker.nutrition.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;

public record NutritionDatesResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<LocalDate> dates) {}
