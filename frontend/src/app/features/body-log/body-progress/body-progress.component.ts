import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';
import { BodyLogStore } from '../store/body-log.store';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { toDateString } from '../../../shared/helper/toDateString';

interface MeasurementSession {
  date: Date;
  value: number;
}

interface MeasurementProgressRow {
  measurement: string;
  unit: 'cm';
  sessions: MeasurementSession[];
}

type Range = '1M' | '3M' | '6M' | '1Y' | 'All';

type MeasurementKey =
  | 'chest'
  | 'waist'
  | 'neck'
  | 'bicepsLeft'
  | 'bicepsRight'
  | 'thighLeft'
  | 'thighRight'
  | 'calfLeft'
  | 'calfRight';

const measurementDefinitions: {
  key: MeasurementKey;
  label: string;
}[] = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'neck', label: 'Neck' },
  { key: 'bicepsLeft', label: 'Biceps (L)' },
  { key: 'bicepsRight', label: 'Biceps (R)' },
  { key: 'thighLeft', label: 'Thigh (L)' },
  { key: 'thighRight', label: 'Thigh (R)' },
  { key: 'calfLeft', label: 'Calf (L)' },
  { key: 'calfRight', label: 'Calf (R)' },
];

@Component({
  selector: 'frontend-body-progress',
  standalone: true,
  imports: [
    ButtonModule,
    BaseChartDirective,
    LoadingComponent,
  ],
  templateUrl: './body-progress.component.html',
  styleUrl: './body-progress.component.scss',
})
export class BodyProgressComponent {
  readonly bodyStore = inject(BodyLogStore);

  readonly selectedRange = signal<Range>('1M');
  readonly ranges: Range[] = ['1M', '3M', '6M', '1Y', 'All'];

  readonly rows = computed<MeasurementProgressRow[]>(() => {
    const history = this.bodyStore.measurementHistory();

    return measurementDefinitions
      .map(({ key, label }) => ({
        measurement: label,
        unit: 'cm' as const,
        sessions: history
          .filter((entry) => entry[key] !== null)
          .map((entry) => ({
            date: new Date(`${entry.date}T00:00:00`),
            value: entry[key]!,
          })),
      }))
      .filter((row) => row.sessions.length > 0);
  });

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

  constructor() {
    this.loadSelectedRange();

    effect(() => {
      if (this.bodyStore.measurementHistoryStale()) {
        this.loadSelectedRange();
      }
    });
  }

  selectRange(range: Range): void {
    this.selectedRange.set(range);
    this.loadSelectedRange();
  }

  chartData(row: MeasurementProgressRow): ChartConfiguration<'line'>['data'] {
    return {
      labels: row.sessions.map((session) =>
        session.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      ),
      datasets: [
        {
          data: row.sessions.map((session) => session.value),
          fill: false,
        },
      ],
    };
  }

  latest(row: MeasurementProgressRow): number {
    return row.sessions.at(-1)?.value ?? 0;
  }

  change(row: MeasurementProgressRow): number {
    if (row.sessions.length < 2) {
      return 0;
    }

    return this.latest(row) - row.sessions[0].value;
  }

  private loadSelectedRange(): void {
    const range = this.selectedRange();

    if (range === 'All') {
      this.bodyStore.loadMeasurementHistory();
      return;
    }

    const to = new Date();
    const from = new Date(to);

    const months: Record<Exclude<Range, 'All'>, number> = {
      '1M': 1,
      '3M': 3,
      '6M': 6,
      '1Y': 12,
    };

    from.setMonth(from.getMonth() - months[range]);

    this.bodyStore.loadMeasurementHistory(
      toDateString(from),
      toDateString(to),
    );
  }
}