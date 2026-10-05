package com.alex.workouttracker.workout.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "workout_entry",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_workout_entry_exercise",
          columnNames = {"workout_id", "exercise_id"})
    })
@Getter
@Setter
@NoArgsConstructor
public class WorkoutEntry {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "workout_id", nullable = false)
  private Workout workout;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "exercise_id", nullable = false)
  private Exercise exercise;

  @Column(nullable = false)
  private int sets;

  @Column(nullable = false)
  private int reps;

  @Column(precision = 8, scale = 2)
  private BigDecimal weight;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 10)
  private WeightUnit unit;

  @Column(length = 1000)
  private String notes;

  @Column(nullable = false)
  private int position;
}
