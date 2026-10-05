package com.alex.workouttracker.workout.service;

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
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class WorkoutService {

  private final WorkoutRepository workoutRepository;
  private final ExerciseService exerciseService;

  @Transactional(readOnly = true)
  public WorkoutDatesResponse getAllWorkoutDates() {
    return new WorkoutDatesResponse(workoutRepository.findAllDates());
  }

  @Transactional(readOnly = true)
  public WorkoutResponse getWorkout(LocalDate date) {
    Workout workout =
        workoutRepository
            .findByDate(date)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No workout found for " + date));

    return toResponse(workout);
  }

  @Transactional
  public WorkoutResponse saveWorkout(LocalDate date, SaveWorkoutRequest request) {
    Workout workout = workoutRepository.findByDate(date).orElseGet(() -> new Workout(date));

    if (workout.getId() != null) {
      workout.clearEntries();
      workoutRepository.flush();
    }

    Set<Long> usedExerciseIds = new HashSet<>();

    for (WorkoutEntryRequest entryRequest : request.entries()) {
      String name = entryRequest.newExerciseName();
      Long id = entryRequest.exerciseId();
      Exercise exercise = exerciseService.findOrCreateExercise(id, name);

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

    return toResponse(savedWorkout);
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

  @Transactional(readOnly = true)
  public List<WorkoutResponse> getWorkoutHistory(LocalDate from, LocalDate to) {
    List<Workout> workouts;

    if (from == null || to == null) {
      workouts = workoutRepository.findAllByOrderByDateAsc();
    } else {
      workouts = workoutRepository.findAllByDateBetweenOrderByDateAsc(from, to);
    }

    return workouts.stream().map(this::toResponse).toList();
  }

  @Transactional
  public void deleteWorkout(LocalDate date) {
    workoutRepository.deleteByDate(date);
  }
}
