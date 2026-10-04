import { Component, effect, inject, linkedSignal, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { type AutoCompleteCompleteEvent, AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { AppStore } from '../../store/app.store';
import { WorkoutHistoryComponent } from './workout-history/workout-history.component';
import type { ExerciseEntry, WeightUnit, WorkoutEntry } from './workout.model';
import { WorkoutLogStore } from './store/workout-log.store';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'frontend-workout-log',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    WorkoutHistoryComponent,
    LoadingComponent
  ],
  templateUrl: './workout-log.component.html',
  styleUrl: './workout-log.component.scss',
})
export class WorkoutLogComponent {
  readonly workoutStore = inject(WorkoutLogStore);
  readonly appStore = inject(AppStore);
  readonly historyOpen = signal(false);
  readonly filteredExercises = signal<ExerciseEntry[]>([]);
  readonly unitOptions: WeightUnit[] = ['BW', 'kg', 'lbs'];
  readonly workoutEntries = linkedSignal(() =>
    this.workoutStore.workoutEntries().map((entry) => ({
      ...entry,
    })),
  );

  constructor() {
    this.workoutStore.loadExercises();

    effect(() => {
      this.loadWorkout(this.appStore.selectedDate());
    });
  }

  saveWorkout(): void {
    this.workoutStore.saveWorkout({
      date: this.toDateString(this.appStore.selectedDate()),
      entries: this.workoutEntries(),
    });
  }

  addWorkoutEntry(): void {
    this.workoutEntries.update((rows) => [
      ...rows,
      {
        exerciseId: null,
        newExerciseName: null,
        sets: 0,
        reps: 0,
        weight: null,
        unit: 'BW',
        notes: null,
        position: rows.length,
      },
    ]);
  }

  removeWorkoutEntry(index: number): void {
    this.workoutEntries.update((rows) =>
      rows
        .filter((_, i) => i !== index)
        .map((entry, position) => ({
          ...entry,
          position,
        })),
    );
  }

  setWorkoutUnit(entry: WorkoutEntry, unit: WeightUnit): void {
    entry.unit = unit;

    if (unit === 'BW') {
      entry.weight = null;
    }
  }

  selectExercise(index: number, exercise: ExerciseEntry): void {
    const duplicate = this.workoutEntries().some(
      (entry, i) => i !== index && entry.exerciseId === exercise.id,
    );

    if (duplicate) {
      return;
    }

    this.workoutEntries.update((entries) =>
      entries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              exerciseId: exercise.id,
              newExerciseName: null,
            }
          : entry,
      ),
    );
  }

  setExerciseName(index: number, name: string): void {
    const trimmedName = name.trim();
    if (!trimmedName) {
      this.workoutEntries.update((entries) =>
        entries.map((entry, i) =>
          i === index
            ? {
                ...entry,
                exerciseId: null,
                newExerciseName: null,
              }
            : entry,
        ),
      );
      return;
    }

    const existingExercise = this.workoutStore
      .exerciseEntries()
      .find(
        (exercise) =>
          this.normalizeExerciseName(exercise.name) === this.normalizeExerciseName(trimmedName),
      );

    if (existingExercise) {
      this.selectExercise(index, existingExercise);
      return;
    }

    const duplicate = this.workoutEntries().some(
      (entry, i) =>
        i !== index &&
        entry.newExerciseName !== null &&
        this.normalizeExerciseName(entry.newExerciseName) ===
          this.normalizeExerciseName(trimmedName),
    );

    if (duplicate) {
      return;
    }

    this.workoutEntries.update((entries) =>
      entries.map((entry, i) =>
        i === index
          ? {
              ...entry,
              exerciseId: null,
              newExerciseName: trimmedName,
            }
          : entry,
      ),
    );
  }

  filterExercises(event: AutoCompleteCompleteEvent, currentIndex: number): void {
    const query = this.normalizeExerciseName(event.query);
    const usedExerciseIds = new Set(
      this.workoutEntries()
        .filter((_, index) => index !== currentIndex)
        .map((entry) => entry.exerciseId)
        .filter((id): id is number => id !== null),
    );

    this.filteredExercises.set(
      this.workoutStore
        .exerciseEntries()
        .filter((exercise) => !usedExerciseIds.has(exercise.id))
        .filter((exercise) => this.normalizeExerciseName(exercise.name).includes(query)),
    );
  }

  onExerciseBlur(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setExerciseName(index, input.value);
  }

  getExerciseValue(entry: WorkoutEntry): ExerciseEntry | string {
    if (entry.exerciseId !== null) {
      return (
        this.workoutStore.exerciseEntries().find((exercise) => exercise.id === entry.exerciseId) ??
        ''
      );
    }
    return entry.newExerciseName ?? '';
  }

  isWorkoutValid(): boolean {
    return (
      this.workoutEntries().length > 0 &&
      this.workoutEntries().every(
        (entry) =>
          (entry.exerciseId !== null || !!entry.newExerciseName?.trim()) &&
          entry.sets >= 0 &&
          entry.reps >= 0,
      )
    );
  }

  private loadWorkout(date: Date): void {
    this.workoutStore.loadWorkout(this.toDateString(date));
  }

  private toDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private normalizeExerciseName(name: string): string {
    return name.trim().toLowerCase();
  }
}
