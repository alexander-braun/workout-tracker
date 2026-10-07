import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthStore } from '../store/auth.store';

@Component({
  selector: 'frontend-login-form',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);

  readonly loggedIn = output<void>();
  readonly registerRequested = output<void>();
  readonly closeRequested = output<void>();
  showPassword = false;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  login(): void {
    if (this.form.invalid || this.authStore.loginInProgress()) {
      this.form.markAllAsTouched();
      return;
    }

    this.authStore
      .login({
        email: this.form.controls.email.value,
        password: this.form.controls.password.value,
      })
      .subscribe({
        next: () => {
          this.loggedIn.emit();
        },
      });
  }
}
