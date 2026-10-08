package com.alex.workouttracker.workout.repository;

import com.alex.workouttracker.workout.model.Workout;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

  Optional<Workout> findByUserIdAndDate(UUID userId, LocalDate date);

  List<Workout> findAllByUserIdAndDateBetweenOrderByDateAsc(
      UUID userId, LocalDate from, LocalDate to);

  List<Workout> findAllByUserIdOrderByDateAsc(UUID userId);

  @Query(
      """
      select w.date
      from Workout w
      where w.user.id = :userId
      order by w.date asc
      """)
  List<LocalDate> findAllDatesByUserId(@Param("userId") UUID userId);

  void deleteByUserIdAndDate(UUID userId, LocalDate date);

  void deleteAllByUserId(UUID userId);

  boolean existsByUserIdAndEntriesExerciseId(UUID userId, UUID exerciseId);
}
