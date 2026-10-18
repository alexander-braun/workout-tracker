import { DOCUMENT } from '@angular/common';
import {
  type AfterViewInit,
  Component,
  computed,
  type ElementRef,
  inject,
  input,
  type OnDestroy,
  ViewChild,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { type ChartConfiguration, type TooltipModel } from 'chart.js';

export interface SparklinePoint {
  date: Date;
  value: number | null;
  unit?: string;
}

@Component({
  selector: 'frontend-sparkline',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './sparkline.component.html',
  styleUrl: './sparkline.component.scss',
})
export class SparklineComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);

  @ViewChild('tooltip', { static: true })
  private tooltipRef!: ElementRef<HTMLDivElement>;

  readonly points = input.required<readonly SparklinePoint[]>();
  readonly secondaryPoints = input<readonly SparklinePoint[]>([]);
  readonly primaryColor = input('#3ea6ff');
  readonly unit = input('');
  readonly decimals = input(2);

  readonly chartData = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.points().map((point) =>
      point.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    ),
    datasets: [
      {
        data: this.points().map((point) => point.value),
        fill: false,
        yAxisID: 'y',
        borderColor: this.primaryColor(),
        backgroundColor: this.primaryColor(),
      },
      ...(this.secondaryPoints().length
        ? [
            {
              data: this.secondaryPoints().map((point) => point.value),
              fill: false,
              yAxisID: 'ySets',
              borderColor: '#ff5a5a',
              backgroundColor: '#ff5a5a',
            },
          ]
        : []),
    ],
  }));

  readonly chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,

    interaction: {
      mode: 'index',
      intersect: false,
    },

    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        external: ({ chart, tooltip }) => {
          this.renderTooltip(chart.canvas, tooltip);
        },
      },
    },

    scales: {
      x: { display: false },
      y: { display: false },
      ySets: {
        display: false,
        position: 'right',
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

  ngAfterViewInit(): void {
    this.document.body.appendChild(this.tooltipRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.tooltipRef.nativeElement.remove();
  }

  private renderTooltip(canvas: HTMLCanvasElement, tooltip: TooltipModel<'line'>): void {
    const element = this.tooltipRef.nativeElement;
    const dataIndex = tooltip.dataPoints[0]?.dataIndex;
    const point = dataIndex === undefined ? undefined : this.points()[dataIndex];
    const setsPoint = dataIndex === undefined ? undefined : this.secondaryPoints()[dataIndex];

    if (tooltip.opacity === 0 || (point?.value == null && setsPoint?.value == null)) {
      element.style.opacity = '0';
      return;
    }

    const date = (point ?? setsPoint)!.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const values = [date];
    if (point?.value != null) {
      const value = point.value.toLocaleString('en-US', {
        maximumFractionDigits: this.decimals(),
      });
      const unit = point.unit ?? this.unit();
      values.push(`${value}${unit ? ` ${unit}` : ''}`);
    }
    if (setsPoint?.value != null) {
      values.push(`${setsPoint.value} ${setsPoint.unit ?? 'sets'}`);
    }
    element.textContent = values.join(' · ');

    const rect = canvas.getBoundingClientRect();
    const x = rect.left + tooltip.caretX;
    const y = rect.top + tooltip.caretY;

    const halfWidth = element.offsetWidth / 2;

    element.style.left = `${Math.max(
      halfWidth + 8,
      Math.min(window.innerWidth - halfWidth - 8, x),
    )}px`;

    element.style.top = `${y}px`;
    element.style.transform =
      y - element.offsetHeight - 10 >= 8
        ? 'translate(-50%, calc(-100% - 10px))'
        : 'translate(-50%, 10px)';

    element.style.opacity = '1';
  }
}
