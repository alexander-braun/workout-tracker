
package com.alex.workouttracker.workout;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "workout",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_workout_date",
            columnNames = "workout_date"
        )
    }
)
@Getter
@Setter
@NoArgsConstructor
public class Workout {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "workout_date", nullable = false)
    private LocalDate date;

    @OneToMany(
        mappedBy = "workout",
        cascade = CascadeType.ALL,
        orphanRemoval = true
    )
    @OrderBy("position ASC")
    private List<WorkoutEntry> entries = new ArrayList<>();

    public Workout(LocalDate date) {
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