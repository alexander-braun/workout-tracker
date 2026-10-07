import { Component, computed, effect, inject } from '@angular/core';
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
      if (!this.authStore.authenticated()) {
        return;
      }

      this.nutritionStore.loadNutritionEntry(toDateString(this.appStore.selectedDate()));
    });

    effect(() => {
      const nutritionEntry = this.nutritionStore.currentNutritionEntry();

      if (nutritionEntry) {
        this.form.patchValue(nutritionEntry);
      } else {
        this.form.reset();
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
    this.nutritionStore.saveNutritionEntry({
      date: toDateString(this.appStore.selectedDate()),
      request: this.form.getRawValue(),
    });
  }

  deleteNutritionEntry(): void {
    this.nutritionStore.deleteNutritionEntry({
      date: toDateString(this.appStore.selectedDate()),
    });
  }
}
