import { Component, computed, effect, inject, signal } from '@angular/core';
import { type HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
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
import { DeleteModalComponent } from '../../shared/components/delete-modal/delete-modal.component';

type DestructiveAction = 'data' | 'account';

@Component({
  selector: 'frontend-account',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ButtonModule, InputTextModule, DeleteModalComponent],
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

  readonly registeredAt = computed(() => {
    const createdAtDate = this.authStore.user()?.createdAt;
    return !createdAtDate
      ? ''
      : new Date(createdAtDate).toLocaleString('en-GB', {
          dateStyle: 'medium',
          timeStyle: 'short',
        });
  });

  readonly emailPending = signal(false);
  readonly passwordUpdatePending = signal(false);
  readonly deletionPending = signal(false);
  readonly emailConfigSuccess = signal('');
  readonly emailError = signal('');
  readonly passwordUpdateSuccessMessage = signal('');
  readonly passwordUpdateErrorMessage = signal('');
  readonly deletionError = signal('');
  readonly deleteType = signal<DestructiveAction | null>(null);

  constructor() {
    effect(() => {
      this.setCurrentUserEmail();
    });
  }

  handleEmailUpdateRequest(): void {
    if (this.emailPending() || this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }

    const email = this.emailForm.controls.email.value.trim().toLowerCase();
    if (email === this.authStore.user()?.email.toLowerCase()) {
      return;
    }

    this.emailConfigSuccess.set('');
    this.emailError.set('');
    this.emailPending.set(true);

    this.setNewEmail(email);
  }

  handlePasswordUpdateRequest(): void {
    if (this.passwordUpdatePending() || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();
    this.passwordUpdateSuccessMessage.set('');
    this.passwordUpdateErrorMessage.set('');

    if (newPassword !== confirmPassword) {
      this.passwordUpdateErrorMessage.set('New passwords do not match.');
      return;
    }

    this.passwordUpdatePending.set(true);
    this.setNewPassword(currentPassword, newPassword);
  }

  handleDeletionRequest(): void {
    if (this.deletionPending() || !this.deleteType()) return;

    this.deletionError.set('');
    this.deletionPending.set(true);

    switch (this.deleteType()) {
      case 'data':
        this.deleteAllData();
        break;
      case 'account':
        this.deleteAccount();
        break;
    }
  }

  showDeletionModal(action: DestructiveAction): void {
    this.deletionError.set('');
    this.deleteType.set(action);
  }

  private setNewEmail(email: string) {
    this.authApi
      .updateEmail({ email })
      .pipe(finalize(() => this.emailPending.set(false)))
      .subscribe({
        next: () => {
          this.handleEmailUpdateSuccess(email);
        },
        error: (error: HttpErrorResponse) => {
          this.handleEmailUpdateError(error);
        },
      });
  }

  private setNewPassword(currentPassword: string, newPassword: string) {
    this.authApi
      .updatePassword({ currentPassword, newPassword })
      .pipe(finalize(() => this.passwordUpdatePending.set(false)))
      .subscribe({
        next: () => {
          this.handlePasswordUpdateSuccess();
        },
        error: (error: HttpErrorResponse) => {
          this.handlePasswordUpdateError(error);
        },
      });
  }

  private deleteAllData(): void {
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
          this.deleteType.set(null);
        },
        error: () => {
          this.deletionError.set(
            'Unable to complete all deletions. Some data may already have been removed.',
          );
        },
      });
  }

  private deleteAccount(): void {
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

  private handleEmailUpdateSuccess(email: string): void {
    this.emailForm.controls.email.setValue(email);
    this.emailForm.markAsPristine();
    this.emailConfigSuccess.set('Email updated successfully.');
    this.authStore.loadCurrentUser();
  }

  private handleEmailUpdateError(error: HttpErrorResponse): void {
    this.emailError.set(
      error.status === 409 ? 'This email address is already in use.' : 'Could not update email.',
    );
  }

  private handlePasswordUpdateSuccess(): void {
    this.passwordForm.reset();
    this.passwordUpdateSuccessMessage.set('Password changed successfully.');
  }

  private handlePasswordUpdateError(error: HttpErrorResponse): void {
    this.passwordUpdateErrorMessage.set(
      error.status === 400 || error.status === 401
        ? 'Incorrect current password or invalid new password.'
        : 'Could not change password.',
    );
  }

  private setCurrentUserEmail(): void {
    const email = this.authStore.user()?.email;
    if (email && !this.emailForm.dirty) {
      this.emailForm.controls.email.setValue(email, { emitEvent: false });
    }
  }
}
