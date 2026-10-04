

package com.alex.workouttracker.workout.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alex.workouttracker.workout.model.Exercise;

import java.util.List;
import java.util.Optional;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    Optional<Exercise> findByNameIgnoreCase(String name);

    List<Exercise> findAllByOrderByNameAsc();
}