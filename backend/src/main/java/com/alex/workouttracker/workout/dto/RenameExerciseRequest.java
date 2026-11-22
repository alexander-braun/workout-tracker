package com.alex.workouttracker.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RenameExerciseRequest(@NotBlank @Size(max = 120) String name) {}
