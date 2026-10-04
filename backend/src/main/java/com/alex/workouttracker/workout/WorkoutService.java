
package com.alex.workouttracker.workout;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import com.alex.workouttracker.workout.dto.SaveWorkoutRequest;
import com.alex.workouttracker.workout.dto.WorkoutEntryRequest;
import com.alex.workouttracker.workout.dto.WorkoutEntryResponse;
import com.alex.workouttracker.workout.dto.WorkoutResponse;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WorkoutService {

        private final WorkoutRepository workoutRepository;
        private final ExerciseRepository exerciseRepository;

        @Transactional(readOnly = true)
        public WorkoutResponse getWorkout(LocalDate date) {
                Workout workout = workoutRepository
                                .findByDate(date)
                                .orElseThrow(() -> new ResponseStatusException(
                                                HttpStatus.NOT_FOUND,
                                                "No workout found for " + date));

                return toResponse(workout);
        }

        @Transactional
        public WorkoutResponse saveWorkout(
                        LocalDate date,
                        SaveWorkoutRequest request) {
                Workout workout = workoutRepository
                                .findByDate(date)
                                .orElseGet(() -> new Workout(date));

                if (workout.getId() != null) {
                        workout.clearEntries();

                        workoutRepository.flush();
                }

                Set<Long> usedExerciseIds = new HashSet<>();

                for (WorkoutEntryRequest entryRequest : request.entries()) {
                        Exercise exercise = resolveExercise(entryRequest);

                        if (!usedExerciseIds.add(exercise.getId())) {
                                throw new IllegalArgumentException(
                                                "Exercise appears more than once: " + exercise.getName());
                        }

                        WorkoutEntry entry = new WorkoutEntry();

                        entry.setExercise(exercise);
                        entry.setSets(entryRequest.sets());
                        entry.setReps(entryRequest.reps());
                        entry.setWeight(
                                        entryRequest.unit() == WeightUnit.BW
                                                        ? null
                                                        : entryRequest.weight());
                        entry.setUnit(entryRequest.unit());
                        entry.setNotes(entryRequest.notes());
                        entry.setPosition(entryRequest.position());

                        workout.addEntry(entry);
                }

                Workout savedWorkout = workoutRepository.save(workout);

                return toResponse(savedWorkout);
        }

        private Exercise resolveExercise(WorkoutEntryRequest request) {
                if (request.exerciseId() != null) {
                        return exerciseRepository
                                        .findById(request.exerciseId())
                                        .orElseThrow(() -> new IllegalArgumentException(
                                                        "Exercise not found: " + request.exerciseId()));
                }

                String name = request.newExerciseName();

                if (name == null || name.isBlank()) {
                        throw new IllegalArgumentException(
                                        "Exercise must have either an id or a new name");
                }

                String trimmedName = name.trim();

                return exerciseRepository
                                .findByNameIgnoreCase(trimmedName)
                                .orElseGet(() -> exerciseRepository.save(
                                                new Exercise(trimmedName)));
        }

        private WorkoutResponse toResponse(Workout workout) {
                return new WorkoutResponse(
                                workout.getId(),
                                workout.getDate(),
                                workout.getEntries()
                                                .stream()
                                                .map(entry -> new WorkoutEntryResponse(
                                                                entry.getId(),
                                                                entry.getExercise().getId(),
                                                                entry.getSets(),
                                                                entry.getReps(),
                                                                entry.getWeight(),
                                                                entry.getUnit(),
                                                                entry.getNotes(),
                                                                entry.getPosition()))
                                                .toList());
        }

        @Transactional(readOnly = true)
        public List<WorkoutResponse> getWorkoutHistory(
                        LocalDate from,
                        LocalDate to) {
                List<Workout> workouts;

                if (from == null || to == null) {
                        workouts = workoutRepository.findAllByOrderByDateAsc();
                } else {
                        workouts = workoutRepository
                                        .findAllByDateBetweenOrderByDateAsc(from, to);
                }

                return workouts.stream()
                                .map(this::toResponse)
                                .toList();
        }
}