import { Component, computed, effect, inject, OnDestroy, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';
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
import { type TooltipModel } from 'chart.js';

type ProgressMetric = 'reps' | 'sets' | 'weight';

@Component({
  selector: 'frontend-workout-history',
  standalone: true,
  imports: [ButtonModule, BaseChartDirective, LoadingComponent],
  templateUrl: './workout-history.component.html',
  styleUrl: './workout-history.component.scss',
})
export class WorkoutHistoryComponent implements OnDestroy {
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

        const latest = sessions[sessions.length - 1];
        const previous = sessions[sessions.length - 2];
        const change: ProgressChange | null = previous
          ? {
              sets: latest.sets - previous.sets,
              reps: latest.reps - previous.reps,
              weight:
                latest.weightUnit === previous.weightUnit &&
                latest.weight !== undefined &&
                previous.weight !== undefined
                  ? latest.weight - previous.weight
                  : null,
              weightUnit: latest.weightUnit,
            }
          : null;
        return {
          exercise: exercise.exercise,
          sessions,
          previous: previous ? this.formatSession(previous) : '—',
          previousSub: previous ? `${previous.sets} sets` : '',
          latest: this.formatSession(latest),
          latestSub: `${latest.sets} sets`,
          change,
        };
      })
      .filter((row): row is ProgressRow => row !== null),
  );
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

  ngOnDestroy(): void {
    document.getElementById('workout-history-tooltip')?.remove();
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

  private formatSession(session: WorkoutSession): string {
    if (session.weightUnit === 'BW') {
      return `${session.reps} reps @ BW`;
    }
    if (session.weight === null || session.weight === undefined) {
      return `${session.reps} reps`;
    }
    return `${session.reps} reps @ ${session.weight} ${session.weightUnit}`;
  }

  chartData(row: ProgressRow): ChartConfiguration<'line'>['data'] {
    const metric = this.selectedMetric();
    return {
      labels: row.sessions.map((session) =>
        session.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      ),
      datasets: [
        {
          data: row.sessions.map((session) => {
            switch (metric) {
              case 'sets':
                return session.sets;
              case 'weight':
                return session.weight ?? null;
              case 'reps':
                return session.reps;
            }
          }),
          fill: false,
        },
      ],
    };
  }

  private renderTooltip(canvas: HTMLCanvasElement, tooltip: TooltipModel<'line'>): void {
    let element = document.getElementById('workout-history-tooltip');
    if (!element) {
      element = document.createElement('div');
      element.id = 'workout-history-tooltip';
      document.body.appendChild(element);
    }

    if (tooltip.opacity === 0) {
      element.style.opacity = '0';
      return;
    }

    const metric = this.selectedMetric();
    const value = tooltip.dataPoints[0]?.parsed.y;
    const date = tooltip.title[0] ?? '';

    if (value === null || value === undefined) {
      element.style.opacity = '0';
      return;
    }

    const unit = metric === 'weight' ? 'kg' : metric;
    element.textContent = `${date} · ${value} ${unit}`;

    const rect = canvas.getBoundingClientRect();
    element.style.left = `${rect.left + window.scrollX + tooltip.caretX}px`;
    element.style.top = `${rect.top + window.scrollY + tooltip.caretY}px`;
    element.style.opacity = '1';
  }

  readonly sparklineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: 'nearest',
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: ({ chart, tooltip }) => {
          console.log('External tooltip:', tooltip.opacity);
          this.renderTooltip(chart.canvas, tooltip);
        },
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
        hoverRadius: 4,
      },
    },
  };
}
