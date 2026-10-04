package com.alex.workouttracker.workout.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alex.workouttracker.workout.model.Workout;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface WorkoutRepository extends JpaRepository<Workout, Long> {

    Optional<Workout> findByDate(LocalDate date);

    List<Workout> findAllByDateBetweenOrderByDateAsc(
        LocalDate from,
        LocalDate to
    );

    List<Workout> findAllByOrderByDateAsc();
}