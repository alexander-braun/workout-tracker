package com.alex.workouttracker.workout.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record MergeExercisesRequest(@NotNull UUID targetUuid) {}
