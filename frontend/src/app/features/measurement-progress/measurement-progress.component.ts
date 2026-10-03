import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

interface MeasurementSession {
  date: Date;
  value: number;
}

interface MeasurementProgressRow {
  measurement: string;
  unit: 'cm' | 'kg';
  sessions: MeasurementSession[];
}

@Component({
  selector: 'frontend-measurement-progress',
  standalone: true,
  imports: [
    ButtonModule,
    BaseChartDirective,
  ],
  templateUrl: './measurement-progress.component.html',
  styleUrl: './measurement-progress.component.scss',
})
export class MeasurementProgressComponent {
  selectedRange = '1M';

  ranges = ['1M', '3M', '6M', '1Y', 'All'];

  rows: MeasurementProgressRow[] = [
    {
      measurement: 'Weight',
      unit: 'kg',
      sessions: [
        { date: new Date('2026-09-05'), value: 82.3 },
        { date: new Date('2026-09-12'), value: 81.5 },
        { date: new Date('2026-09-20'), value: 80.6 },
        { date: new Date('2026-10-03'), value: 80.0 },
      ],
    },
    {
      measurement: 'Chest',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 96.5 },
        { date: new Date('2026-09-12'), value: 97.1 },
        { date: new Date('2026-09-20'), value: 97.8 },
        { date: new Date('2026-10-03'), value: 98.0 },
      ],
    },
    {
      measurement: 'Waist',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 86.0 },
        { date: new Date('2026-09-12'), value: 85.1 },
        { date: new Date('2026-09-20'), value: 84.2 },
        { date: new Date('2026-10-03'), value: 83.0 },
      ],
    },
    {
      measurement: 'Neck',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 39.0 },
        { date: new Date('2026-09-12'), value: 39.0 },
        { date: new Date('2026-09-20'), value: 39.0 },
        { date: new Date('2026-10-03'), value: 39.0 },
      ],
    },
    {
      measurement: 'Biceps (L)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 31.0 },
        { date: new Date('2026-09-12'), value: 31.3 },
        { date: new Date('2026-09-20'), value: 31.7 },
        { date: new Date('2026-10-03'), value: 32.0 },
      ],
    },
    {
      measurement: 'Biceps (R)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 31.3 },
        { date: new Date('2026-09-12'), value: 31.7 },
        { date: new Date('2026-09-20'), value: 32.1 },
        { date: new Date('2026-10-03'), value: 32.5 },
      ],
    },
    {
      measurement: 'Thigh (L)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 55.2 },
        { date: new Date('2026-09-12'), value: 55.4 },
        { date: new Date('2026-09-20'), value: 55.8 },
        { date: new Date('2026-10-03'), value: 56.0 },
      ],
    },
    {
      measurement: 'Thigh (R)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 55.3 },
        { date: new Date('2026-09-12'), value: 55.5 },
        { date: new Date('2026-09-20'), value: 55.8 },
        { date: new Date('2026-10-03'), value: 56.0 },
      ],
    },
    {
      measurement: 'Calf (L)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 35.5 },
        { date: new Date('2026-09-12'), value: 35.7 },
        { date: new Date('2026-09-20'), value: 35.9 },
        { date: new Date('2026-10-03'), value: 36.0 },
      ],
    },
    {
      measurement: 'Calf (R)',
      unit: 'cm',
      sessions: [
        { date: new Date('2026-09-05'), value: 35.5 },
        { date: new Date('2026-09-12'), value: 35.7 },
        { date: new Date('2026-09-20'), value: 35.9 },
        { date: new Date('2026-10-03'), value: 36.0 },
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

  chartData(row: MeasurementProgressRow): ChartConfiguration<'line'>['data'] {
    return {
      labels: row.sessions.map(session =>
        session.date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      ),
      datasets: [
        {
          data: row.sessions.map(session => session.value),
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
}