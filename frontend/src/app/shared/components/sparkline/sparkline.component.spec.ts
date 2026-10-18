import { TestBed } from '@angular/core/testing';
import { type Chart, type TooltipModel } from 'chart.js';
import { describe, expect, it } from 'vitest';
import { SparklineComponent } from './sparkline.component';

describe('SparklineComponent', () => {
  it('renders chart data and manages its tooltip lifecycle', async () => {
    await TestBed.configureTestingModule({
      imports: [SparklineComponent],
    })
      .overrideComponent(SparklineComponent, {
        set: {
          imports: [],
          template: '<div #tooltip class="sparkline-tooltip"></div>',
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(SparklineComponent);

    fixture.componentRef.setInput('points', [
      { date: new Date(2026, 9, 14), value: 82.5 },
      { date: new Date(2026, 9, 15), value: 83.1 },
    ]);
    fixture.componentRef.setInput('unit', 'kg');
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component.chartData().datasets[0].data).toEqual([82.5, 83.1]);

    const tooltipElement = document.body.querySelector('.sparkline-tooltip');
    expect(tooltipElement).not.toBeNull();

    const external = component.chartOptions?.plugins?.tooltip?.external;
    expect(external).toBeTypeOf('function');

    const canvas = document.createElement('canvas');
    
    const tooltip = {
      opacity: 1,
      caretX: 20,
      caretY: 20,
      dataPoints: [{ dataIndex: 0 }],
    } as TooltipModel<'line'>;

    external?.call(tooltip, {
      chart: { canvas } as Chart<'line'>,
      tooltip,
    });

    expect(tooltipElement?.textContent).toBe('Oct 14 · 82.5 kg');

    fixture.destroy();
    expect(tooltipElement?.isConnected).toBe(false);
  });
});
