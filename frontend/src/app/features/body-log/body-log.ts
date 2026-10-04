import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { BodyComponent } from './body/body.component';
import { BodyProgressComponent } from './body-progress/body-progress.component';

interface Measurement {
  key: string;
  label: string;
  value: number | null;
  unit: 'cm' | 'kg';
}

@Component({
  selector: 'frontend-body-log',
  standalone: true,
  imports: [FormsModule, ButtonModule, InputNumberModule, BodyComponent, BodyProgressComponent],
  templateUrl: './body-log.html',
  styleUrl: './body-log.scss',
})
export class BodyLogComponent {
  historyOpen = false;
  leftMeasurements: Measurement[] = [
    {
      key: 'chest',
      label: 'Chest',
      value: 98,
      unit: 'cm',
    },
    {
      key: 'waist',
      label: 'Waist',
      value: 83,
      unit: 'cm',
    },
    {
      key: 'neck',
      label: 'Neck',
      value: 39,
      unit: 'cm',
    },
  ];

  rightMeasurements: Measurement[] = [
    {
      key: 'bicepsLeft',
      label: 'Biceps (L)',
      value: 32,
      unit: 'cm',
    },
    {
      key: 'bicepsRight',
      label: 'Biceps (R)',
      value: 32.5,
      unit: 'cm',
    },
    {
      key: 'thighLeft',
      label: 'Thigh (L)',
      value: 56,
      unit: 'cm',
    },
    {
      key: 'thighRight',
      label: 'Thigh (R)',
      value: 56,
      unit: 'cm',
    },
    {
      key: 'calfLeft',
      label: 'Calf (L)',
      value: 36,
      unit: 'cm',
    },
    {
      key: 'calfRight',
      label: 'Calf (R)',
      value: 36,
      unit: 'cm',
    },
  ];

  saveMeasurements(): void {
    console.log([...this.leftMeasurements, ...this.rightMeasurements]);
  }
}
