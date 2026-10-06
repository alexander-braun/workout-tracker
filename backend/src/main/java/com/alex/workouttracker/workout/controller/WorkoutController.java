package com.alex.workouttracker.workout.controller;

import com.alex.workouttracker.workout.dto.SaveWorkoutRequest;
import com.alex.workouttracker.workout.dto.WorkoutDatesResponse;
import com.alex.workouttracker.workout.dto.WorkoutResponse;
import com.alex.workouttracker.workout.service.WorkoutService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workouts")
@RequiredArgsConstructor
public class WorkoutController {

  private final WorkoutService workoutService;

  @GetMapping("/{date}")
  public WorkoutResponse getWorkout(@PathVariable LocalDate date) {
    return workoutService.getWorkout(date);
  }

  @PutMapping("/{date}")
  public WorkoutResponse saveWorkout(
      @PathVariable LocalDate date, @Valid @RequestBody SaveWorkoutRequest request) {
    return workoutService.saveWorkout(date, request);
  }

  @GetMapping
  public List<WorkoutResponse> getWorkoutHistory(
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to) {
    return workoutService.getWorkoutHistory(from, to);
  }

  @GetMapping("/dates")
  public WorkoutDatesResponse getAllWorkoutDates() {
    return workoutService.getAllWorkoutDates();
  }

  @DeleteMapping("/{date}")
  public void deleteWorkout(@PathVariable LocalDate date) {
    workoutService.deleteWorkout(date);
  }

  @DeleteMapping
  public void deleteAllWorkouts() {
    workoutService.deleteAllWorkouts();
  }
}
