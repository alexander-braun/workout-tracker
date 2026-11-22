package com.alex.workouttracker.workout.controller;

import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.workout.dto.ExerciseResponse;
import com.alex.workouttracker.workout.dto.MergeExercisesRequest;
import com.alex.workouttracker.workout.dto.RenameExerciseRequest;
import com.alex.workouttracker.workout.service.ExerciseService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
  private final ExerciseService exerciseService;
  private final CurrentUserService currentUserService;

  @GetMapping("/{id}")
  public ExerciseResponse getExercise(@PathVariable UUID id) {
    UUID userId = currentUserService.getUser().getId();
    return exerciseService.getExercise(userId, id);
  }

  @GetMapping
  public List<ExerciseResponse> getExercises() {
    return exerciseService.getExercises();
  }

  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PatchMapping("/{id}")
  public void renameExercise(
      @PathVariable UUID id, @Valid @RequestBody RenameExerciseRequest request) {
    exerciseService.renameExercise(id, request);
  }

  @PostMapping("/{sourceExerciseId}/merge")
  public void mergeExercises(
      @PathVariable UUID sourceExerciseId, @Valid @RequestBody MergeExercisesRequest request) {
    exerciseService.mergeExercises(sourceExerciseId, request);
  }
}
