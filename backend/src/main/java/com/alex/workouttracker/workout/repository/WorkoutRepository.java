package com.alex.workouttracker.workout.repository;

import com.alex.workouttracker.workout.model.Workout;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WorkoutRepository extends JpaRepository<Workout, UUID> {

  Optional<Workout> findByDate(LocalDate date);

  List<Workout> findAllByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);

  List<Workout> findAllByOrderByDateAsc();

  @Query("select w.date from Workout w order by w.date asc")
  List<LocalDate> findAllDates();

  void deleteByDate(LocalDate date);
}
