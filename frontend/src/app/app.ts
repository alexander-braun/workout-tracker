import { Component, signal } from '@angular/core';
import { ProgressHistoryComponent } from './features/progress-history/progress-history.component';
import { WorkoutLogComponent } from './features/workout-log/workout-log.component';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { BodyMeasurementsComponent } from './features/body-measurements/body-measurements';
import { MeasurementProgressComponent } from './features/measurement-progress/measurement-progress.component';

@Component({
  imports: [ProgressHistoryComponent, MeasurementProgressComponent, BodyMeasurementsComponent, WorkoutLogComponent, DatePickerModule, FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  selectedDate: Date = new Date();
}
