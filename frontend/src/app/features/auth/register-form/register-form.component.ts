import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { AuthApiService } from '../auth-api.service';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'frontend-register-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './register-form.component.html',
  styleUrl: './register-form.component.scss',
})
export class RegisterFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authApi = inject(AuthApiService);
  readonly authStore = inject(AuthStore);

  readonly registered = output<void>();
  readonly loginRequested = output<void>();

  showPassword = false;
  showConfirmPassword = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
    confirmPassword: ['', Validators.required],
  });

  get password(): string {
    return this.form.controls.password.value;
  }

  get hasMinimumLength(): boolean {
    return this.password.length >= 8;
  }

  get hasLetter(): boolean {
    return /[a-zA-Z]/.test(this.password);
  }

  get hasNumber(): boolean {
    return /\d/.test(this.password);
  }

  get passwordsMatch(): boolean {
    return (
      this.form.controls.confirmPassword.value.length > 0 &&
      this.form.controls.password.value === this.form.controls.confirmPassword.value
    );
  }

  register(): void {
    if (this.form.invalid || !this.passwordsMatch) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore
      .register({
        email: this.form.controls.email.value,
        password: this.form.controls.password.value,
      })
      .subscribe({
        next: () => this.registered.emit(),
      });
  }
}
