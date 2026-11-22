import { Component, input, output } from '@angular/core';
import { type Range } from '../../types/range.model';

@Component({
  selector: 'frontend-range-selector',
  standalone: true,
  templateUrl: './range-selector.component.html',
  styleUrl: './range-selector.component.scss',
})
export class RangeSelectorComponent {
  ranges = input.required<Range[]>();
  selectedRange = input.required<Range>();

  selectedRangeChange = output<Range>();
}
