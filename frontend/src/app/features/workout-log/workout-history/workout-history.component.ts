import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';
import { WorkoutLogStore } from '../store/workout-log.store';
import {
  type ExerciseHistory,
  type ProgressRow,
  type Range,
  type WorkoutSession,
} from './workout-history.model';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'frontend-workout-history',
  standalone: true,
  imports: [ButtonModule, BaseChartDirective, LoadingComponent],
  templateUrl: './workout-history.component.html',
  styleUrl: './workout-history.component.scss',
})
export class WorkoutHistoryComponent {
  readonly store = inject(WorkoutLogStore);
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
        const latest = sessions.at(-1)!;

        const best = sessions.reduce((currentBest, session) =>
          session.reps > currentBest.reps ? session : currentBest,
        );

        return {
          exercise: exercise.exercise,
          sessions,
          best: this.formatSession(best),
          bestSub: `${best.sets} sets`,
          latest: this.formatSession(latest),
          latestSub: `${latest.sets} sets`,
          change: latest.reps - first.reps,
          unit: 'reps',
        };
      })
      .filter((row): row is ProgressRow => row !== null),
  );
  readonly history = computed<ExerciseHistory[]>(() => {
    const workouts = this.store.workoutHistory();
    const exercises = this.store.exerciseEntries();
    const sessionsByExercise = new Map<number, WorkoutSession[]>();

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
    this.selectRange('1M');
    effect(() => {
      if (this.store.workoutHistoryStale()) {
        this.loadSelectedRange();
      }
    });
  }

  selectRange(range: Range): void {
    this.selectedRange.set(range);
    this.loadSelectedRange();
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

  private formatSession(session: WorkoutSession): string {
    if (session.weightUnit === 'BW') {
      return `${session.reps} reps @ BW`;
    }

    if (session.weight == null) {
      return `${session.reps} reps`;
    }

    return `${session.reps} reps @ ${session.weight} ${session.weightUnit}`;
  }

  chartData(row: ProgressRow): ChartConfiguration<'line'>['data'] {
    return {
      labels: row.sessions.map((session) =>
        session.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      ),
      datasets: [
        {
          data: row.sessions.map((session) => session.reps),
          fill: false,
        },
      ],
    };
  }

  readonly sparklineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },

    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },

    elements: {
      line: {
        borderWidth: 2,
        tension: 0.25,
      },
      point: {
        radius: 2.5,
        hoverRadius: 2.5,
      },
    },
  };
}
