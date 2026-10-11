import { Component, computed, effect, inject, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';

import { NutritionAndSleepHistoryComponent } from './nutrition-and-sleep-history/nutrition-and-sleep-history.component';
import { NutritionLogStore } from './store/nutrition-log.store';
import { AppStore } from '../../store/app.store';
import { toDateString } from '../../shared/helper/toDateString';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AuthStore } from '../auth/store/auth.store';

@Component({
  selector: 'frontend-nutrition-and-sleep-log',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    NutritionAndSleepHistoryComponent,
    LoadingComponent,
  ],
  templateUrl: './nutrition-and-sleep-log.component.html',
  styleUrl: './nutrition-and-sleep-log.component.scss',
})
export class NutritionAndSleepLogComponent {
  readonly nutritionStore = inject(NutritionLogStore);
  readonly appStore = inject(AppStore);
  readonly authStore = inject(AuthStore);
  readonly fb = inject(FormBuilder);

  readonly ratingOptions = [1, 2, 3, 4, 5];
  readonly nutritionReady = computed(
    () =>
      this.authStore.authenticated() &&
      this.nutritionStore.loadedDate() === toDateString(this.appStore.selectedDate()) &&
      !this.nutritionStore.nutritionEntryLoading() &&
      !this.nutritionStore.nutritionEntrySaveInProgress(),
  );
  readonly form = this.fb.group({
    calories: this.fb.control<number | null>(null),
    protein: this.fb.control<number | null>(null),
    sleepHours: this.fb.control<number | null>(null),
    steps: this.fb.control<number | null>(null),
    sleepQuality: this.fb.control<number | null>(null),
    energy: this.fb.control<number | null>(null),
    notes: this.fb.control<string | null>(null),
  });

  historyOpen = false;

  readonly hasSavedNutritionEntry = computed(
    () => this.nutritionStore.currentNutritionEntry() !== null,
  );

  constructor() {
    effect(() => {
      const date = this.appStore.selectedDate();

      if (!this.authStore.authenticated() || this.nutritionStore.nutritionEntrySaveInProgress()) {
        return;
      }

      untracked(() => {
        if (this.nutritionStore.loadedDate() !== toDateString(date)) {
          this.nutritionStore.loadNutritionEntry(toDateString(date));
        }
      });
    });

    effect(() => {
      const loadedDate = this.nutritionStore.loadedDate();
      const entry = this.nutritionStore.currentNutritionEntry();

      if (loadedDate === null || entry === null) {
        this.form.reset();
      } else {
        this.form.patchValue(entry);
      }
    });
  }

  setSleepQuality(value: number): void {
    this.form.controls.sleepQuality.setValue(value);
  }

  setEnergy(value: number): void {
    this.form.controls.energy.setValue(value);
  }

  saveLog(): void {
    if (!this.nutritionReady()) return;

    this.nutritionStore.saveNutritionEntry({
      date: toDateString(this.appStore.selectedDate()),
      request: this.form.getRawValue(),
    });
  }

  deleteNutritionEntry(): void {
    if (!this.nutritionReady()) return;

    this.nutritionStore.deleteNutritionEntry({
      date: toDateString(this.appStore.selectedDate()),
    });
  }
}
