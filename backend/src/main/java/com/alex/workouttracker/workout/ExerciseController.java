
package com.alex.workouttracker.workout;


import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@RequiredArgsConstructor
public class ExerciseController {

    private final ExerciseRepository exerciseRepository;

    @GetMapping
    public List<ExerciseResponse> getExercises() {
        return exerciseRepository
            .findAllByOrderByNameAsc()
            .stream()
            .map(exercise ->
                new ExerciseResponse(
                    exercise.getId(),
                    exercise.getName()
                )
            )
            .toList();
    }

    public record ExerciseResponse(
        Long id,
        String name
    ) {
    }
}