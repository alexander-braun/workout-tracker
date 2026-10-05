package com.alex.workouttracker.workout.repository;

import com.alex.workouttracker.workout.model.Exercise;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

  Optional<Exercise> findByNameIgnoreCase(String name);

  List<Exercise> findAllByOrderByNameAsc();
}
