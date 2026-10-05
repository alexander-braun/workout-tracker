import { Component, computed, effect, inject, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';

import { NutritionLogStore } from '../store/nutrition-log.store';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { toDateString } from '../../../shared/helper/toDateString';

type Range = '1W' | '1M' | '3M' | '6M' | 'All';

type NutritionKey =
  | 'calories'
  | 'protein'
  | 'sleepHours'
  | 'sleepQuality'
  | 'steps'
  | 'energy';

interface HistorySession {
  date: Date;
  value: number;
}

interface NutritionSleepHistoryRow {
  key: NutritionKey;
  metric: string;
  unit: string;
  sessions: HistorySession[];
  decimals?: number;
}

const metricDefinitions: {
  key: NutritionKey;
  metric: string;
  unit: string;
  decimals?: number;
}[] = [
  {
    key: 'calories',
    metric: 'Calories',
    unit: 'kcal',
  },
  {
    key: 'protein',
    metric: 'Protein',
    unit: 'g',
  },
  {
    key: 'sleepHours',
    metric: 'Sleep',
    unit: 'h',
    decimals: 1,
  },
  {
    key: 'sleepQuality',
    metric: 'Sleep Quality',
    unit: '/ 5',
  },
  {
    key: 'steps',
    metric: 'Steps',
    unit: 'steps',
  },
  {
    key: 'energy',
    metric: 'Energy',
    unit: '/ 5',
  },
];

@Component({
  selector: 'frontend-nutrition-and-sleep-history',
  standalone: true,
  imports: [
    ButtonModule,
    BaseChartDirective,
    LoadingComponent,
  ],
  templateUrl: './nutrition-and-sleep-history.component.html',
  styleUrl: './nutrition-and-sleep-history.component.scss',
})
export class NutritionAndSleepHistoryComponent {
  readonly nutritionStore = inject(NutritionLogStore);

  readonly selectedRange = signal<Range>('1M');
  readonly ranges: Range[] = ['1W', '1M', '3M', '6M', 'All'];

  readonly rows = computed<NutritionSleepHistoryRow[]>(() => {
    const history = this.nutritionStore.nutritionHistory();

    return metricDefinitions
      .map((definition) => ({
        ...definition,
        sessions: history
          .filter((entry) => entry[definition.key] !== null)
          .map((entry) => ({
            date: new Date(`${entry.date}T00:00:00`),
            value: entry[definition.key]!,
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
      if (this.nutritionStore.nutritionHistoryStale()) {
        this.loadSelectedRange();
      }
    });
  }

  selectRange(range: Range): void {
    this.selectedRange.set(range);
    this.loadSelectedRange();
  }

  chartData(row: NutritionSleepHistoryRow): ChartConfiguration<'line'>['data'] {
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

  latest(row: NutritionSleepHistoryRow): number {
    return row.sessions.at(-1)?.value ?? 0;
  }

  change(row: NutritionSleepHistoryRow): number {
    if (row.sessions.length < 2) {
      return 0;
    }

    return this.latest(row) - row.sessions[0].value;
  }

  formatValue(row: NutritionSleepHistoryRow, value: number): string {
    const decimals = row.decimals ?? 0;

    if (row.unit === '/ 5') {
      return `${value.toFixed(decimals)} / 5`;
    }

    return `${value.toFixed(decimals)} ${row.unit}`;
  }

  formatChange(row: NutritionSleepHistoryRow): string {
    const value = this.change(row);
    const decimals = row.decimals ?? 0;

    if (row.unit === '/ 5') {
      return value.toFixed(decimals);
    }

    return `${value.toFixed(decimals)} ${row.unit}`;
  }

  private loadSelectedRange(): void {
    const range = this.selectedRange();

    if (range === 'All') {
      this.nutritionStore.loadNutritionHistory({});
      return;
    }

    const to = new Date();
    const from = new Date(to);

    switch (range) {
      case '1W':
        from.setDate(from.getDate() - 7);
        break;

      case '1M':
        from.setMonth(from.getMonth() - 1);
        break;

      case '3M':
        from.setMonth(from.getMonth() - 3);
        break;

      case '6M':
        from.setMonth(from.getMonth() - 6);
        break;
    }

    this.nutritionStore.loadNutritionHistory({
      from: toDateString(from),
      to: toDateString(to),
    });
  }
}