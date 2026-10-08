package com.alex.workouttracker.workout.service;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.workout.dto.ExerciseResponse;
import com.alex.workouttracker.workout.model.Exercise;
import com.alex.workouttracker.workout.repository.ExerciseRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {
  private final ExerciseRepository exerciseRepository;
  private final CurrentUserService currentUserService;

  public List<ExerciseResponse> getExercises() {
    return exerciseRepository
        .findAllByUserIdOrderByNameAsc(currentUserService.getUser().getId())
        .stream()
        .map(exercise -> new ExerciseResponse(exercise.getId(), exercise.getName()))
        .toList();
  }

  public void deleteExercise(UUID userId, UUID exerciseId) {
    exerciseRepository.deleteByUserIdAndId(userId, exerciseId);
  }

  public Exercise findOrCreateExercise(AppUser user, UUID exerciseId, String newExerciseName) {
    if (exerciseId != null) {
      return exerciseRepository
          .findByUserIdAndId(user.getId(), exerciseId)
          .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + exerciseId));
    }

    if (newExerciseName == null || newExerciseName.isBlank()) {
      throw new IllegalArgumentException("Exercise must have either an id or a new name");
    }

    String trimmedName = newExerciseName.trim();

    return exerciseRepository
        .findByUserIdAndNameIgnoreCase(user.getId(), trimmedName)
        .orElseGet(() -> exerciseRepository.save(new Exercise(user, trimmedName)));
  }

  public void deleteAllByUserId(UUID userId) {
    exerciseRepository.deleteAllByUserId(userId);
  }
}
