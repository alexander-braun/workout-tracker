
import { Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { WorkoutLogStore } from '../../../features/workout-log/store/workout-log.store';
import { BodyLogStore } from '../../../features/body-log/store/body-log.store';
import { NutritionLogStore } from '../../../features/nutrition-and-sleep-log/store/nutrition-log.store';

@Component({
  selector: 'frontend-datepicker',
  imports: [FormsModule, DatePickerModule],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.scss',
})
export class DatepickerComponent {
  private readonly workoutStore = inject(WorkoutLogStore);
  private readonly bodyStore = inject(BodyLogStore);
  private readonly nutritionStore = inject(NutritionLogStore);

  readonly selectedDate = model.required<Date>();
  readonly inline = input(false);
  readonly disabled = input(false);

  readonly workoutDates = computed(() => new Set(this.workoutStore.workoutDates()));
  readonly measurementDates = computed(() => new Set(this.bodyStore.measurementDates()));
  readonly nutritionDates = computed(() => new Set(this.nutritionStore.nutritionDates()));

  readonly markedDates = computed(
    () => new Set([...this.workoutDates(), ...this.measurementDates(), ...this.nutritionDates()]),
  );

  dateKey(date: { year: number; month: number; day: number }): string {
    return [
      date.year,
      String(date.month + 1).padStart(2, '0'),
      String(date.day).padStart(2, '0'),
    ].join('-');
  }
}
