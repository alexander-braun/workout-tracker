package com.alex.workouttracker.body.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDate;
import java.util.List;

public record MeasurementDatesResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) List<LocalDate> dates) {}
