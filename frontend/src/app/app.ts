import { Component, inject } from '@angular/core';
import { WorkoutLogComponent } from './features/workout-log/workout-log.component';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { BodyLogComponent } from './features/body-log/body-log';
import { NutritionAndSleepLogComponent } from './features/nutrition-and-sleep-log/nutrition-and-sleep-log.component';
import { AppStore } from './store/app.store'
import { WorkoutLogStore } from './features/workout-log/store/workout-log.store';
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
  providers: [AppStore, WorkoutLogStore]
})
export class App {
  selectedDate: Date = new Date();
  readonly store = inject(AppStore);
}
