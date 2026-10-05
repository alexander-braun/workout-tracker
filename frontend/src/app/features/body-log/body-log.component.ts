import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { type BodyArea, BodyComponent } from './body/body.component';
import { BodyProgressComponent } from './body-progress/body-progress.component';
import { BodyLogStore } from './store/body-log.store';
import { AppStore } from '../../store/app.store';
import { toDateString } from '../../shared/helper/toDateString';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'frontend-body-log',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputNumberModule,
    BodyComponent,
    BodyProgressComponent,
    LoadingComponent,
  ],
  templateUrl: './body-log.component.html',
  styleUrl: './body-log.component.scss',
})
export class BodyLogComponent {
  readonly bodyStore = inject(BodyLogStore);
  readonly appStore = inject(AppStore);
  readonly fb = inject(FormBuilder);
  readonly focusElement = signal<BodyArea>(null);
  readonly form = this.fb.group({
    chest: this.fb.control<number | null>(null),
    waist: this.fb.control<number | null>(null),
    neck: this.fb.control<number | null>(null),
    bicepsLeft: this.fb.control<number | null>(null),
    bicepsRight: this.fb.control<number | null>(null),
    thighLeft: this.fb.control<number | null>(null),
    thighRight: this.fb.control<number | null>(null),
    calfLeft: this.fb.control<number | null>(null),
    calfRight: this.fb.control<number | null>(null),
  });

  historyOpen = false;

  constructor() {
    effect(() => {
      this.bodyStore.loadMeasurement(toDateString(this.appStore.selectedDate()));
    });

    effect(() => {
      const measurement = this.bodyStore.currentMeasurement();

      if (measurement) {
        this.form.patchValue(measurement);
      } else {
        this.form.reset();
      }
    });
  }

  readonly hasSavedMeasurement = computed(() => this.bodyStore.currentMeasurement() !== null);

  deleteMeasurement() {
    this.bodyStore.deleteMeasurement({
      date: toDateString(this.appStore.selectedDate()),
    });
  }

  focus(area: BodyArea): void {
    this.focusElement.set(area);
  }

  removeFocus(): void {
    this.focusElement.set(null);
  }

  saveMeasurements(): void {
    this.bodyStore.saveMeasurement({
      date: toDateString(this.appStore.selectedDate()),
      request: this.form.getRawValue(),
    });
  }
}
