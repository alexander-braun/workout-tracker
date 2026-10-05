package com.alex.workouttracker.workout.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record SaveWorkoutRequest(@NotNull List<@Valid WorkoutEntryRequest> entries) {}
