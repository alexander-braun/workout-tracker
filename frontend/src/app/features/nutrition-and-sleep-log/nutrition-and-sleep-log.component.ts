import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { NutritionAndSleepHistoryComponent } from './nutrition-and-sleep-history/nutrition-and-sleep-history.component';

@Component({
  selector: 'frontend-nutrition-and-sleep-log',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    TextareaModule,
    InputNumberModule,
    NutritionAndSleepHistoryComponent,
  ],
  templateUrl: './nutrition-and-sleep-log.component.html',
  styleUrl: './nutrition-and-sleep-log.component.scss',
})
export class NutritionAndSleepLogComponent {
  historyOpen = false;
  calories: number | null = 2417;
  protein: number | null = 156;
  sleepHours: number | null = 7.5;
  steps: number | null = 6840;

  sleepQuality = 3;
  energy = 3;

  notes = 'slept well, shoulder felt good';

  readonly ratingOptions = [1, 2, 3, 4, 5];

  setSleepQuality(value: number): void {
    this.sleepQuality = value;
  }

  setEnergy(value: number): void {
    this.energy = value;
  }

  saveLog(): void {
    const payload = {
      calories: this.calories,
      protein: this.protein,
      sleepHours: this.sleepHours,
      steps: this.steps,
      sleepQuality: this.sleepQuality,
      energy: this.energy,
      notes: this.notes,
    };

    console.log('Save nutrition & sleep log', payload);
  }
}
