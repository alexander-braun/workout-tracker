import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Button } from './shared/ui/button/button.component';
import { ProgressHistoryComponent } from './features/progress-history/progress-history.component';
import { WorkoutLogComponent } from './features/workout-log/workout-log.component';

@Component({
  imports: [ProgressHistoryComponent, WorkoutLogComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {}
