package com.alex.workouttracker.workout.model;

import com.alex.workouttracker.auth.model.AppUser;
import jakarta.persistence.*;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "exercise",
    uniqueConstraints =
        @UniqueConstraint(
            name = "uk_exercise_user_name",
            columnNames = {"user_id", "name"}))
@Getter
@Setter
@NoArgsConstructor
public class Exercise {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private AppUser user;

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(name = "exercise_id")
  private UUID id;

  @Column(nullable = false, length = 120)
  private String name;

  public Exercise(AppUser user, String name) {
    this.user = user;
    this.name = name;
  }
}
