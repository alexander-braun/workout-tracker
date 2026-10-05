package com.alex.workouttracker.workout.dto;

import java.time.LocalDate;
import java.util.List;

public record WorkoutResponse(Long id, LocalDate date, List<WorkoutEntryResponse> entries) {}
