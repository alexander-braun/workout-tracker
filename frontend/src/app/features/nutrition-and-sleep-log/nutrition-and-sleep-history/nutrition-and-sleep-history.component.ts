import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration } from 'chart.js';

type Range = '1W' | '1M' | '3M' | '6M' | 'All';

interface HistorySession {
  date: Date;
  value: number;
}

interface NutritionSleepHistoryRow {
  metric: string;
  unit: string;
  sessions: HistorySession[];
  decimals?: number;
  suffix?: string;
}

@Component({
  selector: 'frontend-nutrition-and-sleep-history',
  standalone: true,
  imports: [ButtonModule, BaseChartDirective],
  templateUrl: './nutrition-and-sleep-history.component.html',
  styleUrl: './nutrition-and-sleep-history.component.scss',
})
export class NutritionAndSleepHistoryComponent {
  selectedRange: Range = '1M';

  readonly ranges: Range[] = ['1W', '1M', '3M', '6M', 'All'];

  rows: NutritionSleepHistoryRow[] = [
    {
      metric: 'Calories',
      unit: 'kcal',
      sessions: [
        { date: new Date('2026-09-05'), value: 2280 },
        { date: new Date('2026-09-12'), value: 2350 },
        { date: new Date('2026-09-20'), value: 2310 },
        { date: new Date('2026-09-27'), value: 2400 },
        { date: new Date('2026-10-03'), value: 2417 },
      ],
    },
    {
      metric: 'Protein',
      unit: 'g',
      sessions: [
        { date: new Date('2026-09-05'), value: 139 },
        { date: new Date('2026-09-12'), value: 145 },
        { date: new Date('2026-09-20'), value: 148 },
        { date: new Date('2026-09-27'), value: 151 },
        { date: new Date('2026-10-03'), value: 156 },
      ],
    },
    {
      metric: 'Sleep',
      unit: 'h',
      decimals: 1,
      sessions: [
        { date: new Date('2026-09-05'), value: 7.0 },
        { date: new Date('2026-09-12'), value: 7.4 },
        { date: new Date('2026-09-20'), value: 6.8 },
        { date: new Date('2026-09-27'), value: 7.2 },
        { date: new Date('2026-10-03'), value: 7.5 },
      ],
    },
    {
      metric: 'Sleep Quality',
      unit: '/ 5',
      decimals: 0,
      sessions: [
        { date: new Date('2026-09-05'), value: 3 },
        { date: new Date('2026-09-12'), value: 4 },
        { date: new Date('2026-09-20'), value: 3 },
        { date: new Date('2026-09-27'), value: 4 },
        { date: new Date('2026-10-03'), value: 4 },
      ],
    },
    {
      metric: 'Steps',
      unit: 'steps',
      sessions: [
        { date: new Date('2026-09-05'), value: 7700 },
        { date: new Date('2026-09-12'), value: 8100 },
        { date: new Date('2026-09-20'), value: 7200 },
        { date: new Date('2026-09-27'), value: 7000 },
        { date: new Date('2026-10-03'), value: 6840 },
      ],
    },
    {
      metric: 'Energy',
      unit: '/ 5',
      decimals: 0,
      sessions: [
        { date: new Date('2026-09-05'), value: 4 },
        { date: new Date('2026-09-12'), value: 3 },
        { date: new Date('2026-09-20'), value: 4 },
        { date: new Date('2026-09-27'), value: 4 },
        { date: new Date('2026-10-03'), value: 4 },
      ],
    },
  ];

  sparklineOptions: ChartConfiguration<'line'>['options'] = {
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

  filteredSessions(row: NutritionSleepHistoryRow): HistorySession[] {
    if (this.selectedRange === 'All') {
      return row.sessions;
    }

    const latest = row.sessions.at(-1)?.date;

    if (!latest) {
      return [];
    }

    const start = new Date(latest);

    switch (this.selectedRange) {
      case '1W':
        start.setDate(start.getDate() - 7);
        break;

      case '1M':
        start.setMonth(start.getMonth() - 1);
        break;

      case '3M':
        start.setMonth(start.getMonth() - 3);
        break;

      case '6M':
        start.setMonth(start.getMonth() - 6);
        break;
    }

    return row.sessions.filter((session) => session.date >= start);
  }

  chartData(row: NutritionSleepHistoryRow): ChartConfiguration<'line'>['data'] {
    const sessions = this.filteredSessions(row);

    return {
      labels: sessions.map((session) =>
        session.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      ),
      datasets: [
        {
          data: sessions.map((session) => session.value),
          fill: false,
        },
      ],
    };
  }

  latest(row: NutritionSleepHistoryRow): number {
    return this.filteredSessions(row).at(-1)?.value ?? 0;
  }

  change(row: NutritionSleepHistoryRow): number {
    const sessions = this.filteredSessions(row);

    if (sessions.length < 2) {
      return 0;
    }

    return sessions.at(-1)!.value - sessions[0].value;
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
}
