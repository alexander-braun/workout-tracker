package com.alex.workouttracker.workout.service;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.workout.dto.SaveWorkoutRequest;
import com.alex.workouttracker.workout.dto.WorkoutDatesResponse;
import com.alex.workouttracker.workout.dto.WorkoutEntryRequest;
import com.alex.workouttracker.workout.dto.WorkoutEntryResponse;
import com.alex.workouttracker.workout.dto.WorkoutResponse;
import com.alex.workouttracker.workout.model.Exercise;
import com.alex.workouttracker.workout.model.WeightUnit;
import com.alex.workouttracker.workout.model.Workout;
import com.alex.workouttracker.workout.model.WorkoutEntry;
import com.alex.workouttracker.workout.repository.WorkoutRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkoutService {

  private final WorkoutRepository workoutRepository;
  private final ExerciseService exerciseService;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public WorkoutDatesResponse getAllWorkoutDates() {
    return new WorkoutDatesResponse(
        workoutRepository.findAllDatesByUserId(currentUserService.getUser().getId()));
  }

  @Transactional(readOnly = true)
  public WorkoutResponse getWorkout(LocalDate date) {
    return workoutRepository
        .findByUserIdAndDate(currentUserService.getUser().getId(), date)
        .map(this::toResponse)
        .orElseGet(() -> WorkoutResponse.empty(date));
  }

  @Transactional
  public WorkoutResponse saveWorkout(LocalDate date, SaveWorkoutRequest request) {
    if (request.entries().isEmpty()) {
      deleteWorkout(date);
      return WorkoutResponse.empty(date);
    }

    AppUser user = currentUserService.getUser();
    List<WorkoutEntry> currentEntries = new ArrayList<>();
    Workout workout =
        workoutRepository
            .findByUserIdAndDate(user.getId(), date)
            .map(
                currentWorkout -> {
                  currentEntries.addAll(currentWorkout.getEntries());
                  return currentWorkout;
                })
            .orElseGet(() -> new Workout(user, date));

    List<UUID> exercisesToRemove = new ArrayList<>();

    for (WorkoutEntry workoutEntry : currentEntries) {
      UUID exerciseId = workoutEntry.getExercise().getId();

      boolean stillExists =
          request.entries().stream().anyMatch(entry -> exerciseId.equals(entry.exerciseId()));

      if (!stillExists) {
        exercisesToRemove.add(exerciseId);
      }
    }

    if (workout.getId() != null) {
      workout.clearEntries();
      workoutRepository.flush();
    }

    Set<UUID> usedExerciseIds = new HashSet<>();

    for (WorkoutEntryRequest entryRequest : request.entries()) {
      String name = entryRequest.newExerciseName();
      UUID id = entryRequest.exerciseId();
      Exercise exercise = exerciseService.findOrCreateExercise(user, id, name);

      if (!usedExerciseIds.add(exercise.getId())) {
        throw new IllegalArgumentException(
            "Exercise appears more than once: " + exercise.getName());
      }

      WorkoutEntry entry = new WorkoutEntry();

      entry.setExercise(exercise);
      entry.setSets(entryRequest.sets());
      entry.setReps(entryRequest.reps());
      entry.setWeight(entryRequest.unit() == WeightUnit.BW ? null : entryRequest.weight());
      entry.setUnit(entryRequest.unit());
      entry.setNotes(entryRequest.notes());
      entry.setPosition(entryRequest.position());

      workout.addEntry(entry);
    }

    Workout savedWorkout = workoutRepository.save(workout);
    workoutRepository.flush();

    for (UUID exerciseIdToRemove : exercisesToRemove) {
      boolean exerciseExistsOnUser =
          workoutRepository.existsByUserIdAndEntriesExerciseId(user.getId(), exerciseIdToRemove);
      if (!exerciseExistsOnUser) {
        exerciseService.deleteExercise(user.getId(), exerciseIdToRemove);
      }
    }

    return toResponse(savedWorkout);
  }

  @Transactional(readOnly = true)
  public List<WorkoutResponse> getWorkoutHistory(LocalDate from, LocalDate to) {
    List<Workout> workouts;
    AppUser user = currentUserService.getUser();

    if (from == null || to == null) {
      workouts = workoutRepository.findAllByUserIdOrderByDateAsc(user.getId());
    } else {
      workouts =
          workoutRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(user.getId(), from, to);
    }

    return workouts.stream().map(this::toResponse).toList();
  }

  @Transactional
  public void deleteWorkout(LocalDate date) {
    AppUser user = currentUserService.getUser();
    List<Exercise> exercises = new ArrayList<>();
    workoutRepository
        .findByUserIdAndDate(user.getId(), date)
        .ifPresent(
            workout -> {
              for (WorkoutEntry entry : workout.getEntries()) {
                exercises.add(entry.getExercise());
              }
            });
    workoutRepository.deleteByUserIdAndDate(user.getId(), date);
    workoutRepository.flush();

    for (Exercise exercise : exercises) {
      boolean exerciseExistsInOtherWorkout =
          workoutRepository.existsByUserIdAndEntriesExerciseId(user.getId(), exercise.getId());
      if (!exerciseExistsInOtherWorkout) {
        exerciseService.deleteExercise(user.getId(), exercise.getId());
      }
    }
  }

  @Transactional
  public void deleteAllWorkouts() {
    AppUser user = currentUserService.getUser();
    workoutRepository.deleteAllByUserId(user.getId());
    workoutRepository.flush();
    exerciseService.deleteAllByUserId(user.getId());
  }

  private WorkoutResponse toResponse(Workout workout) {
    return new WorkoutResponse(
        workout.getId(),
        workout.getDate(),
        workout.getEntries().stream()
            .map(
                entry ->
                    new WorkoutEntryResponse(
                        entry.getId(),
                        entry.getExercise().getId(),
                        entry.getSets(),
                        entry.getReps(),
                        entry.getWeight(),
                        entry.getUnit(),
                        entry.getNotes(),
                        entry.getPosition()))
            .toList());
  }
}
