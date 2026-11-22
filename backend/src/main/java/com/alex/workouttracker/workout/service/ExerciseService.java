package com.alex.workouttracker.workout.service;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.workout.dto.ExerciseResponse;
import com.alex.workouttracker.workout.dto.MergeExercisesRequest;
import com.alex.workouttracker.workout.dto.RenameExerciseRequest;
import com.alex.workouttracker.workout.model.Exercise;
import com.alex.workouttracker.workout.model.WorkoutEntry;
import com.alex.workouttracker.workout.repository.ExerciseRepository;
import com.alex.workouttracker.workout.repository.WorkoutEntryRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ExerciseService {
  private final ExerciseRepository exerciseRepository;
  private final CurrentUserService currentUserService;
  private final WorkoutEntryRepository workoutEntryRepository;

  public ExerciseResponse getExercise(UUID userId, UUID exerciseId) {
    return exerciseRepository
        .findByUserIdAndId(userId, exerciseId)
        .map(exercise -> new ExerciseResponse(exerciseId, exercise.getName()))
        .orElseThrow(() -> new IllegalArgumentException("Exercise not found."));
  }

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

  @Transactional
  public void renameExercise(UUID exerciseId, RenameExerciseRequest request) {
    UUID userId = currentUserService.getUser().getId();
    var exercise = exerciseRepository.findByUserIdAndId(userId, exerciseId).orElseThrow();

    var name = request.name().trim();
    Optional<Exercise> existingExercise =
        exerciseRepository.findByUserIdAndNameIgnoreCase(userId, name);
    if (existingExercise.isPresent() && !existingExercise.get().getId().equals(exercise.getId())) {
      throw new IllegalArgumentException("Exercise name already exists.");
    }

    exercise.setName(name);
  }

  @Transactional
  public void mergeExercises(UUID sourceExerciseId, MergeExercisesRequest request) {
    UUID userId = currentUserService.getUser().getId();
    Exercise sourceExercise =
        exerciseRepository
            .findByUserIdAndId(userId, sourceExerciseId)
            .orElseThrow(() -> new IllegalArgumentException("Source exercise does not exist."));

    Exercise targetExercise =
        exerciseRepository
            .findByUserIdAndId(userId, request.targetUuid())
            .orElseThrow(() -> new IllegalArgumentException("Target exercise does not exist."));

    if (sourceExercise.getId().equals(targetExercise.getId())) {
      throw new IllegalArgumentException("Source exercise and target exercise are the same.");
    }

    List<WorkoutEntry> workoutEntriesContainingSourceExercise =
        workoutEntryRepository.findAllByExerciseId(sourceExerciseId);
    workoutEntriesContainingSourceExercise.forEach(entry -> {
      boolean entryExistedInWorkout =
          entry.getWorkout().getEntries().stream()
              .anyMatch(workoutEntry ->
                  workoutEntry.getExercise().getId().equals(targetExercise.getId()));
      if (entryExistedInWorkout) {
        // If both exercises are in the same workout, remove this old entry and assume the new one
        // is correct
        entry.getWorkout().getEntries().remove(entry);
      } else {
        entry.setExercise(targetExercise);
      }
    });

    workoutEntryRepository.flush();
    exerciseRepository.deleteById(sourceExercise.getId());
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

  public void deleteAll() {
    exerciseRepository.deleteAllByUserId(currentUserService.getUser().getId());
  }
}
