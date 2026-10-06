package com.alex.workouttracker.body.dto;

import java.time.LocalDate;
import java.util.List;

public record MeasurementDatesResponse(List<LocalDate> dates) {}
