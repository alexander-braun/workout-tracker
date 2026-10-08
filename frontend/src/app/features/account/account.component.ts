import { Component, effect, inject, signal } from '@angular/core';
import { type HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../auth/store/auth.store';
import { AccountApiService } from './account-api.service';
import { WorkoutApiService } from '../workout-log/workout-api.service';
import { BodyApiService } from '../body-log/body-api.service';
import { NutritionApiService } from '../nutrition-and-sleep-log/nutrition-api.service';
import { WorkoutLogStore } from '../workout-log/store/workout-log.store';
import { BodyLogStore } from '../body-log/store/body-log.store';
import { NutritionLogStore } from '../nutrition-and-sleep-log/store/nutrition-log.store';
import { RouterLink } from '@angular/router';

type DestructiveAction = 'data' | 'account';

@Component({
  selector: 'frontend-account',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent {
  readonly authStore = inject(AuthStore);

  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AccountApiService);
  private readonly workoutApi = inject(WorkoutApiService);
  private readonly bodyApi = inject(BodyApiService);
  private readonly nutritionApi = inject(NutritionApiService);
  private readonly workoutStore = inject(WorkoutLogStore);
  private readonly bodyStore = inject(BodyLogStore);
  private readonly nutritionStore = inject(NutritionLogStore);

  readonly emailForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });
  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required],
  });

  readonly emailPending = signal(false);
  readonly passwordPending = signal(false);
  readonly deletionPending = signal(false);
  readonly emailMessage = signal('');
  readonly emailError = signal('');
  readonly passwordMessage = signal('');
  readonly passwordError = signal('');
  readonly deletionError = signal('');
  readonly confirmation = signal<DestructiveAction | null>(null);
  readonly confirmationText = signal('');

  constructor() {
    effect(() => {
      const email = this.authStore.user()?.email;
      if (email && !this.emailForm.dirty) {
        this.emailForm.controls.email.setValue(email, { emitEvent: false });
      }
    });
  }

  registeredAt(value: string): string {
    return new Date(value).toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }

  changeEmail(): void {
    if (this.emailPending() || this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.controls.email.value.trim().toLowerCase();
    if (email === this.authStore.user()?.email.toLowerCase()) return;

    this.emailMessage.set('');
    this.emailError.set('');
    this.emailPending.set(true);

    this.authApi
      .updateEmail({ email })
      .pipe(finalize(() => this.emailPending.set(false)))
      .subscribe({
        next: () => {
          this.emailForm.controls.email.setValue(email);
          this.emailForm.markAsPristine();
          this.emailMessage.set('Email updated successfully.');
          this.authStore.loadCurrentUser();
        },
        error: (error: HttpErrorResponse) => {
          this.emailError.set(
            error.status === 409
              ? 'This email address is already in use.'
              : 'Could not update email.',
          );
        },
      });
  }

  changePassword(): void {
    if (this.passwordPending() || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    this.passwordMessage.set('');
    this.passwordError.set('');

    if (newPassword !== confirmPassword) {
      this.passwordError.set('New passwords do not match.');
      return;
    }

    this.passwordPending.set(true);
    this.authApi
      .updatePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.passwordPending.set(false)))
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.passwordMessage.set('Password changed successfully.');
        },
        error: (error: HttpErrorResponse) => {
          this.passwordError.set(
            error.status === 400 || error.status === 401
              ? 'Incorrect current password or invalid new password.'
              : 'Could not change password.',
          );
        },
      });
  }

  requestDeletion(action: DestructiveAction): void {
    this.deletionError.set('');
    this.confirmationText.set('');
    this.confirmation.set(action);
  }

  onDialogVisibleChange(visible: boolean): void {
    if (!visible && !this.deletionPending()) this.confirmation.set(null);
  }

  confirmDeletion(): void {
    if (this.deletionPending() || this.confirmationText() !== 'DELETE') return;

    this.deletionError.set('');
    this.deletionPending.set(true);

    if (this.confirmation() === 'data') {
      forkJoin([
        this.workoutApi.deleteAllWorkouts(),
        this.bodyApi.deleteAllMeasurements(),
        this.nutritionApi.deleteAllNutritionEntries(),
      ])
        .pipe(finalize(() => this.deletionPending.set(false)))
        .subscribe({
          next: () => {
            this.workoutStore.clearStore();
            this.bodyStore.clearStore();
            this.nutritionStore.clearStore();
            this.confirmation.set(null);
            this.confirmationText.set('');
          },
          error: () => {
            this.deletionError.set(
              'Unable to complete all deletions. Some data may already have been removed.',
            );
          },
        });
      return;
    }

    if (this.confirmation() === 'account') {
      this.authApi
        .deleteAccount()
        .pipe(finalize(() => this.deletionPending.set(false)))
        .subscribe({
          next: () => {
            // A full navigation clears all client stores after the backend invalidates the session.
            window.location.replace('/');
          },
          error: () => this.deletionError.set('Unable to delete account.'),
        });
    }
  }
}
