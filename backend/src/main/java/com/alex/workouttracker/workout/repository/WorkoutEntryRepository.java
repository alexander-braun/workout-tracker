package com.alex.workouttracker.workout.repository;

import com.alex.workouttracker.workout.model.WorkoutEntry;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkoutEntryRepository extends JpaRepository<WorkoutEntry, UUID> {

  List<WorkoutEntry> findAllByExerciseId(UUID exerciseId);
}
