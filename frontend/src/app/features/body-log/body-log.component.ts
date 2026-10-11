import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

import { type BodyArea, BodyComponent } from './body/body.component';
import { BodyProgressComponent } from './body-progress/body-progress.component';
import { BodyLogStore } from './store/body-log.store';
import { AppStore } from '../../store/app.store';
import { toDateString } from '../../shared/helper/toDateString';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { AuthStore } from '../auth/store/auth.store';

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
  readonly authStore = inject(AuthStore);
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
    weight: this.fb.control<number | null>(null),
  });

  historyOpen = false;
  readonly measurementReady = computed(
    () =>
      this.authStore.authenticated() &&
      this.bodyStore.loadedDate() === toDateString(this.appStore.selectedDate()) &&
      !this.bodyStore.measurementsLoading() &&
      !this.bodyStore.measurementSaveInProgress(),
  );

  constructor() {
    effect(() => {
      const date = this.appStore.selectedDate();

      if (!this.authStore.authenticated() || this.bodyStore.measurementSaveInProgress()) {
        return;
      }

      untracked(() => {
        if (this.bodyStore.loadedDate() !== toDateString(date)) {
          this.bodyStore.loadMeasurement(toDateString(date));
        }
      });
    });

    effect(() => {
      const loadedDate = this.bodyStore.loadedDate();
      const measurement = this.bodyStore.currentMeasurement();

      if (loadedDate === null || measurement === null) {
        this.form.reset();
      } else {
        this.form.patchValue(measurement);
      }
    });
  }

  readonly hasSavedMeasurement = computed(() => this.bodyStore.currentMeasurement() !== null);

  deleteMeasurement() {
    if (!this.measurementReady()) return;
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

  isFormEmpty(): boolean {
    return Object.values(this.form.getRawValue()).every((value) => value === null);
  }

  saveMeasurements(): void {
    if (!this.measurementReady()) return;

    if (this.bodyStore.currentMeasurement() === null && this.isFormEmpty()) {
      return;
    } else if (this.isFormEmpty() && this.bodyStore.currentMeasurement() !== null) {
      this.bodyStore.deleteMeasurement({ date: toDateString(this.appStore.selectedDate()) });
      return;
    }
    this.bodyStore.saveMeasurement({
      date: toDateString(this.appStore.selectedDate()),
      request: this.form.getRawValue(),
    });
  }
}
