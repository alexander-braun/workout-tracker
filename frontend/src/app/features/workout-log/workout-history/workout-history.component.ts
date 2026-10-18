import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { WorkoutLogStore } from '../store/workout-log.store';
import {
  type ProgressChange,
  type ExerciseHistory,
  type ProgressRow,
  type Range,
  type WorkoutSession,
} from './workout-history.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { AuthStore } from '../../auth/store/auth.store';
import {
  SparklineComponent,
  type SparklinePoint,
} from '../../../shared/components/sparkline/sparkline.component';

type ProgressMetric = 'reps' | 'sets' | 'weight';

@Component({
  selector: 'frontend-workout-history',
  standalone: true,
  imports: [ButtonModule, SparklineComponent, LoadingComponent],
  templateUrl: './workout-history.component.html',
  styleUrl: './workout-history.component.scss',
})
export class WorkoutHistoryComponent {
  readonly store = inject(WorkoutLogStore);
  readonly authStore = inject(AuthStore);
  readonly selectedMetric = signal<ProgressMetric>('reps');
  readonly metrics: ProgressMetric[] = ['reps', 'sets', 'weight'];
  readonly selectedRange = signal<Range>('1M');
  readonly ranges: Range[] = ['1M', '3M', '6M', 'All'];
  readonly rows = computed<ProgressRow[]>(() =>
    this.history()
      .map((exercise) => {
        const sessions = exercise.sessions;
        if (!sessions.length) {
          return null;
        }

        const first = sessions[0];
        const latest = sessions[sessions.length - 1];

        const change: ProgressChange | null =
          sessions.length > 1
            ? {
                sets: latest.sets - first.sets,
                reps: latest.reps - first.reps,
                weight:
                  latest.weightUnit === first.weightUnit &&
                  latest.weight !== undefined &&
                  first.weight !== undefined
                    ? latest.weight - first.weight
                    : null,
                weightUnit: latest.weightUnit,
              }
            : null;

        return {
          exercise: exercise.exercise,
          sessions,
          latestReps: latest.reps,
          latestWeightSuffix: this.formatWeightSuffix(latest),
          latestSets: latest.sets,
          change,
        };
      })
      .filter((row): row is ProgressRow => row !== null),
  );

  readonly chartRows = computed(() => {
    const metric = this.selectedMetric();

    return this.rows().map((row) => ({
      ...row,
      chartPoints: row.sessions.map<SparklinePoint>((session) => ({
        date: session.date,
        value:
          metric === 'reps'
            ? session.reps
            : metric === 'sets'
              ? session.sets
              : (session.weight ?? null),
        unit: metric === 'weight' ? (session.weightUnit ?? '') : metric,
      })),
      setsPoints:
        metric === 'sets'
          ? []
          : row.sessions.map<SparklinePoint>((session) => ({
              date: session.date,
              value: session.sets,
              unit: 'sets',
            })),
    }));
  });

  readonly history = computed<ExerciseHistory[]>(() => {
    const workouts = this.store.workoutHistory();
    const exercises = this.store.exerciseEntries();
    const sessionsByExercise = new Map<string, WorkoutSession[]>();

    for (const workout of workouts) {
      for (const entry of workout.entries) {
        const sessions = sessionsByExercise.get(entry.exerciseId) ?? [];
        sessions.push({
          date: new Date(`${workout.date}T00:00:00`),
          reps: entry.reps,
          sets: entry.sets,
          weight: entry.weight ?? undefined,
          weightUnit: entry.unit ?? undefined,
        });
        sessionsByExercise.set(entry.exerciseId, sessions);
      }
    }

    return [...sessionsByExercise.entries()].map(([exerciseId, sessions]) => ({
      exercise:
        exercises.find((exercise) => exercise.id === exerciseId)?.name ?? `Exercise ${exerciseId}`,
      sessions: sessions.sort((a, b) => a.date.getTime() - b.date.getTime()),
    }));
  });

  constructor() {
    effect(() => {
      if (!this.authStore.authenticated()) {
        return;
      }

      this.loadSelectedRange();
    });

    effect(() => {
      if (!this.authStore.authenticated()) {
        return;
      }

      if (this.store.workoutHistoryStale()) {
        this.loadSelectedRange();
      }
    });
  }

  selectRange(range: Range): void {
    this.selectedRange.set(range);
  }

  private loadSelectedRange(): void {
    const range = this.selectedRange();
    if (range === 'All') {
      this.store.loadWorkoutHistory({});
      return;
    }

    const to = new Date();
    const from = new Date(to);
    const months: Record<Exclude<Range, 'All'>, number> = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
    };

    from.setMonth(from.getMonth() - months[range]);
    this.store.loadWorkoutHistory({ from: this.formatDate(from), to: this.formatDate(to) });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatWeightSuffix(session: WorkoutSession): string {
    if (session.weightUnit === 'BW') {
      return ' @ BW';
    }
    if (session.weight === null || session.weight === undefined) {
      return '';
    }
    return ` @ ${session.weight} ${session.weightUnit}`;
  }
}
