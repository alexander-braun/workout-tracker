package com.alex.workouttracker.workout.repository;

import com.alex.workouttracker.workout.model.Exercise;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {

  Optional<Exercise> findByUserIdAndNameIgnoreCase(UUID userId, String name);

  List<Exercise> findAllByUserIdOrderByNameAsc(UUID userId);

  Optional<Exercise> findByUserIdAndId(UUID userId, UUID id);

  void deleteByUserIdAndId(UUID userId, UUID exerciseId);

  void deleteAllByUserId(UUID userId);
}
