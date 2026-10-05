package com.alex.workouttracker.workout.controller;

import com.alex.workouttracker.workout.dto.ExerciseResponse;
import com.alex.workouttracker.workout.service.ExerciseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {
  private final ExerciseService exerciseService;

  @GetMapping
  public List<ExerciseResponse> getExercises() {
    return exerciseService.getExercises();
  }
}
