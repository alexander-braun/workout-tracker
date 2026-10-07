package com.alex.workouttracker.workout.model;

import com.alex.workouttracker.auth.model.AppUser;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "workout",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_workout_user_date",
          columnNames = {"user_id", "workout_date"})
    })
@Getter
@Setter
@NoArgsConstructor
public class Workout {

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private AppUser user;

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "workout_date", nullable = false)
  private LocalDate date;

  @OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position ASC")
  private List<WorkoutEntry> entries = new ArrayList<>();

  public Workout(AppUser user, LocalDate date) {
    this.user = user;
    this.date = date;
  }

  public void addEntry(WorkoutEntry entry) {
    entries.add(entry);
    entry.setWorkout(this);
  }

  public void clearEntries() {
    entries.clear();
  }
}
