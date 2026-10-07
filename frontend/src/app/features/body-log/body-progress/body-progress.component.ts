import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';
import { BodyLogStore } from '../store/body-log.store';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { toDateString } from '../../../shared/helper/toDateString';
import { AuthStore } from '../../auth/store/auth.store';

interface MeasurementSession {
  date: Date;
  value: number;
}
interface MeasurementProgressRow {
  measurement: string;
  unit: 'cm' | 'kg';
  sessions: MeasurementSession[];
}

const measurementDefinitions: {
  key: MeasurementKey;
  label: string;
  unit: 'cm' | 'kg';
}[] = [
  { key: 'weight', label: 'Weight', unit: 'kg' },
  { key: 'chest', label: 'Chest', unit: 'cm' },
  { key: 'waist', label: 'Waist', unit: 'cm' },
  { key: 'neck', label: 'Neck', unit: 'cm' },
  { key: 'bicepsLeft', label: 'Biceps (L)', unit: 'cm' },
  { key: 'bicepsRight', label: 'Biceps (R)', unit: 'cm' },
  { key: 'thighLeft', label: 'Thigh (L)', unit: 'cm' },
  { key: 'thighRight', label: 'Thigh (R)', unit: 'cm' },
  { key: 'calfLeft', label: 'Calf (L)', unit: 'cm' },
  { key: 'calfRight', label: 'Calf (R)', unit: 'cm' },
];

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
  | 'calfRight'
  | 'weight';

@Component({
  selector: 'frontend-body-progress',
  standalone: true,
  imports: [ButtonModule, BaseChartDirective, LoadingComponent],
  templateUrl: './body-progress.component.html',
  styleUrl: './body-progress.component.scss',
})
export class BodyProgressComponent {
  readonly bodyStore = inject(BodyLogStore);
  readonly authStore = inject(AuthStore);

  readonly selectedRange = signal<Range>('1M');
  readonly ranges: Range[] = ['1M', '3M', '6M', '1Y', 'All'];

  readonly rows = computed<MeasurementProgressRow[]>(() => {
    const history = this.bodyStore.measurementHistory();

    return measurementDefinitions
      .map(({ key, label, unit }) => ({
        measurement: label,
        unit,
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

      if (this.bodyStore.measurementHistoryStale()) {
        this.loadSelectedRange();
      }
    });
  }

  selectRange(range: Range): void {
    this.selectedRange.set(range);
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
      this.bodyStore.loadMeasurementHistory({});
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

    this.bodyStore.loadMeasurementHistory({
      from: toDateString(from),
      to: toDateString(to),
    });
  }
}
