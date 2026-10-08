import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './features/auth/store/auth.store';
import { WorkoutLogStore } from './features/workout-log/store/workout-log.store';
import { BodyLogStore } from './features/body-log/store/body-log.store';
import { NutritionLogStore } from './features/nutrition-and-sleep-log/store/nutrition-log.store';

@Component({
  selector: 'frontend-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  private readonly authStore = inject(AuthStore);
  private readonly workoutLogStore = inject(WorkoutLogStore);
  private readonly nutritionLogStore = inject(NutritionLogStore);
  private readonly bodyLogStore = inject(BodyLogStore);

  constructor() {
    this.authStore.loadCurrentUser();

    effect(() => {
      if (!this.authStore.initialized() || !this.authStore.authenticated()) return;
      this.workoutLogStore.getWorkoutDates();
      this.nutritionLogStore.getNutritionDates();
      this.bodyLogStore.getMeasurementDates();
    });
  }
}
