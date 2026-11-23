import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

import { WorkoutLogStore } from '../store/workout-log.store';
import { type WorkoutEntry } from '../workout.model';
import { toDateString } from '../../../shared/helper/toDateString';
import { DatepickerComponent } from '../../../shared/components/datepicker/datepicker.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'frontend-import-workout-dialog',
  imports: [DialogModule, ButtonModule, DatepickerComponent, LoadingComponent],
  templateUrl: './import-workout-dialog.component.html',
})
export class ImportWorkoutDialogComponent {
  private readonly workoutStore = inject(WorkoutLogStore);
  private readonly destroyRef = inject(DestroyRef);

  readonly modalVisible = model(false);
  readonly targetDate = input.required<Date>();
  readonly workoutImported = output<WorkoutEntry[]>();

  readonly selectedDate = signal(new Date());
  readonly workoutImportInProgress = signal(false);
  readonly importError = signal<string | null>(null);
  readonly canImport = computed(() => {
    const sourceDate = toDateString(this.selectedDate());
    return (
      !this.workoutImportInProgress() &&
      sourceDate !== toDateString(this.targetDate()) &&
      this.workoutStore.workoutDates().includes(sourceDate)
    );
  });

  constructor() {
    effect(() => this.resetSelectedDateOnOpen());
  }

  private resetSelectedDateOnOpen(): void {
    if (this.modalVisible()) {
      this.selectedDate.set(new Date());
      this.importError.set(null);
    }
  }

  importWorkout(): void {
    if (!this.canImport()) {
      return;
    }

    const sourceDate = toDateString(this.selectedDate());

    this.workoutImportInProgress.set(true);
    this.importError.set(null);

    this.workoutStore
      .getWorkoutEntriesForDate(sourceDate)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.workoutImportInProgress.set(false)),
      )
      .subscribe({
        next: (entries) => {
          this.workoutImported.emit(entries);
          this.modalVisible.set(false);
        },
        error: (error) => {
          console.error('Failed to import workout', error);
          this.importError.set('Failed to load the selected workout.');
        },
      });
  }
}
