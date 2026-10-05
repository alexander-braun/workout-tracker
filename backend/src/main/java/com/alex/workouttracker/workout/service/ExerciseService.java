package com.alex.workouttracker.workout.service;

import com.alex.workouttracker.workout.dto.ExerciseResponse;
import com.alex.workouttracker.workout.model.Exercise;
import com.alex.workouttracker.workout.repository.ExerciseRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {
  private final ExerciseRepository exerciseRepository;

  public List<ExerciseResponse> getExercises() {
    return exerciseRepository.findAllByOrderByNameAsc().stream()
        .map(exercise -> new ExerciseResponse(exercise.getId(), exercise.getName()))
        .toList();
  }

  public Exercise findOrCreateExercise(Long exerciseId, String newExerciseName) {
    if (exerciseId != null) {
      return exerciseRepository
          .findById(exerciseId)
          .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + exerciseId));
    }

    if (newExerciseName == null || newExerciseName.isBlank()) {
      throw new IllegalArgumentException("Exercise must have either an id or a new name");
    }

    String trimmedName = newExerciseName.trim();

    return exerciseRepository
        .findByNameIgnoreCase(trimmedName)
        .orElseGet(() -> exerciseRepository.save(new Exercise(trimmedName)));
  }
}
