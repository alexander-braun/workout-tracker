import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface ProgressRow {
  exercise: string;
  sessions: { date: Date; value: number }[];
  best: string;
  bestSub: string;
  latest: string;
  latestSub: string;
  change: number;
  unit: string;
}

@Component({
  selector: 'frontend-progress-history',
  standalone: true,
  imports: [ButtonModule, BaseChartDirective],
  templateUrl: './progress-history.component.html',
  styleUrl: './progress-history.component.scss',
})
export class ProgressHistoryComponent {
  selectedRange = '1M';

  ranges = ['1M', '3M', '6M', 'All'];

  rows: ProgressRow[] = [
    {
      exercise: 'Ring Rows',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '9 reps',
      bestSub: '3 sets',
      latest: '9 reps',
      latestSub: '3 sets',
      change: 4,
      unit: 'reps',
    },
    {
      exercise: 'Scapular Push-ups',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '20 reps',
      bestSub: '3 sets',
      latest: '15 reps',
      latestSub: '3 sets',
      change: 0,
      unit: 'reps',
    },
    {
      exercise: 'Standing Band Row',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '18 reps @ 65 lbs',
      bestSub: '3 sets',
      latest: '15 reps @ 65 lbs',
      latestSub: '3 sets',
      change: -3,
      unit: 'reps',
    },
    {
      exercise: 'Band Internal Rotation',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '14 reps @ 13.6 kg',
      bestSub: '3 sets',
      latest: '14 reps @ 13.6 kg',
      latestSub: '3 sets',
      change: 0,
      unit: 'reps',
    },
    {
      exercise: 'Band External Rotation',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '11 reps @ 13.6 kg',
      bestSub: '3 sets',
      latest: '9 reps @ 13.6 kg',
      latestSub: '3 sets',
      change: -2,
      unit: 'reps',
    },
    {
      exercise: 'Biceps Curls',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '12 reps @ 5 kg',
      bestSub: '3 sets',
      latest: '10 reps @ 5 kg',
      latestSub: '3 sets',
      change: -2,
      unit: 'reps',
    },
    {
      exercise: 'Full Can',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
      ],
      best: '11 reps @ 2.5 kg',
      bestSub: '3 sets',
      latest: '11 reps @ 2.5 kg',
      latestSub: '3 sets',
      change: 0,
      unit: 'reps',
    },
    {
      exercise: 'Crunches',
      sessions: [
        { date: new Date('2026-09-05'), value: 5 },
        { date: new Date('2026-09-12'), value: 7 },
        { date: new Date('2026-09-20'), value: 8 },
        { date: new Date('2026-10-03'), value: 9 },
        { date: new Date('2026-10-05'), value: 10 },
      ],
      best: '11 reps',
      bestSub: '3 sets',
      latest: '11 reps',
      latestSub: '3 sets',
      change: 3,
      unit: 'reps',
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
          data: row.sessions.map((session) => session.value),
          fill: false,
        },
      ],
    };
  }
}
