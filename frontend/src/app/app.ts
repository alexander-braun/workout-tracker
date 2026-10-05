import { Component, computed, inject } from '@angular/core';
import { WorkoutLogComponent } from './features/workout-log/workout-log.component';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { BodyLogComponent } from './features/body-log/body-log.component';
import { NutritionAndSleepLogComponent } from './features/nutrition-and-sleep-log/nutrition-and-sleep-log.component';
import { AppStore } from './store/app.store';
import { WorkoutLogStore } from './features/workout-log/store/workout-log.store';
import { BodyLogStore } from './features/body-log/store/body-log.store';
import { NutritionLogStore } from './features/nutrition-and-sleep-log/store/nutrition-log.store';
@Component({
  imports: [
    NutritionAndSleepLogComponent,
    BodyLogComponent,
    WorkoutLogComponent,
    DatePickerModule,
    FormsModule,
  ],
  selector: 'frontend-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
  providers: [AppStore, WorkoutLogStore, BodyLogStore, NutritionLogStore],
})
export class App {
  selectedDate: Date = new Date();
  readonly store = inject(AppStore);
  readonly workoutLogStore = inject(WorkoutLogStore);
  readonly workoutDates = computed(() => new Set(this.workoutLogStore.workoutDates()));
  hasWorkout(date: { year: number; month: number; day: number }): boolean {
    const key = [
      date.year,
      String(date.month + 1).padStart(2, '0'),
      String(date.day).padStart(2, '0'),
    ].join('-');

    return this.workoutDates().has(key);
  }

  constructor() {
    this.workoutLogStore.getWorkoutDates();
  }
}
