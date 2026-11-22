import { Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { AutoCompleteModule, type AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { type ExerciseResponse } from '../../../../api/generated/api-types';
import { WorkoutLogStore } from '../../store/workout-log.store';

export interface RenameExerciseAction {
  sourceId: string;
  name: string;
}

export interface MergeExerciseAction {
  sourceId: string;
  targetId: string;
}

export type ReplaceExerciseAction = RenameExerciseAction | MergeExerciseAction;

@Component({
  selector: 'frontend-replace-exercise-dialog',
  standalone: true,
  imports: [FormsModule, DialogModule, AutoCompleteModule, ButtonModule],
  templateUrl: './replace-exercise-dialog.component.html',
  styleUrl: './replace-exercise-dialog.component.scss',
})
export class ReplaceExerciseDialogComponent {
  readonly store = inject(WorkoutLogStore);

  readonly exerciseToEdit = input.required<ExerciseResponse>();
  readonly allAvailableExercises = this.store.exerciseEntries;
  readonly modalVisible = model(false);

  readonly replacement = signal<string | ExerciseResponse>('');
  readonly exerciseSuggestions = signal<ExerciseResponse[]>([]);

  readonly replacementName = computed(() => {
    const value = this.replacement();
    return (typeof value === 'string' ? value : value?.name ?? '').trim();
  });

  readonly targetExercise = computed(() => {
    const source = this.exerciseToEdit();
    const name = this.replacementName().toLowerCase();

    if (!source || !name) return null;

    return (
      this.allAvailableExercises().find(
        (exercise) => exercise.id !== source.id && exercise.name.toLowerCase() === name,
      ) ?? null
    );
  });

  readonly isValidRenameOrMergeOperation = computed(() => {
    const name = this.replacementName();
    return (
      name.length > 0 &&
      name.length <= 120 &&
      (name !== this.exerciseToEdit().name || this.targetExercise() !== null)
    );
  });

  constructor() {
    effect(() => this.setReplacementSuggestions());
    effect(() => this.handleRenameOrMergeResult());
  }

  private setReplacementSuggestions(): void {
    if (this.modalVisible()) {
      this.replacement.set(this.exerciseToEdit()?.name ?? '');
      this.exerciseSuggestions.set([]);
    }
  }

  private handleRenameOrMergeResult(): void {
    if (this.store.exerciseUpdateSucceeded()) {
      this.modalVisible.set(false);
      this.store.resetExerciseUpdateSucceeded();
    }
  }

  filterExercises(event: AutoCompleteCompleteEvent): void {
    const query = event.query.trim().toLowerCase();
    const sourceId = this.exerciseToEdit()?.id;

    this.exerciseSuggestions.set(
      this.allAvailableExercises().filter(
        (exercise) => exercise.id !== sourceId && exercise.name.toLowerCase().includes(query),
      ),
    );
  }

  submit(): void {
    if (!this.isValidRenameOrMergeOperation()) {
      return;
    }

    const target = this.targetExercise();
    const source = this.exerciseToEdit();

    if (target) {
      this.store.mergeExercises({ sourceId: source.id, targetId: target.id });
    } else {
      this.store.renameExercise({ sourceId: source.id, name: this.replacementName() });
    }
  }
}
