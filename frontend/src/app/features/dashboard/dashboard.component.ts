import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { WorkoutLogComponent } from '../workout-log/workout-log.component';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { BodyLogComponent } from '../body-log/body-log.component';
import { NutritionAndSleepLogComponent } from '../nutrition-and-sleep-log/nutrition-and-sleep-log.component';
import { AppStore } from '../../store/app.store';
import { WorkoutLogStore } from '../workout-log/store/workout-log.store';
import { BodyLogStore } from '../body-log/store/body-log.store';
import { NutritionLogStore } from '../nutrition-and-sleep-log/store/nutrition-log.store';
import { MenuModule } from 'primeng/menu';
import type { MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { RegisterFormComponent } from '../auth/register-form/register-form.component';
import { LoginFormComponent } from '../auth/login-form/login-form.component';
import { AuthStore } from '../auth/store/auth.store';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'frontend-dashboard',
  imports: [
    NutritionAndSleepLogComponent,
    BodyLogComponent,
    WorkoutLogComponent,
    DatePickerModule,
    FormsModule,
    MenuModule,
    DialogModule,
    RegisterFormComponent,
    LoginFormComponent,
    ButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  readonly store = inject(AppStore);
  readonly authStore = inject(AuthStore);
  readonly workoutLogStore = inject(WorkoutLogStore);
  readonly nutritionLogStore = inject(NutritionLogStore);
  readonly bodyLogStore = inject(BodyLogStore);

  readonly workoutDates = computed(() => new Set(this.workoutLogStore.workoutDates()));
  readonly nutritionDates = computed(() => new Set(this.nutritionLogStore.nutritionDates()));
  readonly measurementDates = computed(() => new Set(this.bodyLogStore.measurementDates()));
  readonly markedDates = computed(
    () => new Set([...this.workoutDates(), ...this.measurementDates(), ...this.nutritionDates()]),
  );

  readonly accountMenuItems = computed<MenuItem[]>(() => {
    const user = this.authStore.user();

    if (user) {
      return [
        { label: 'Logged in', icon: 'pi pi-check-circle', disabled: true },
        { label: user.email, icon: 'pi pi-user', disabled: true },
        { separator: true },
        {
          label: 'Account',
          icon: 'pi pi-user-edit',
          command: () => void this.router.navigate(['/account']),
        },
        {
          label: 'Logout',
          icon: 'pi pi-sign-out',
          command: () => this.authStore.logout(),
        },
      ];
    }

    return [
      {
        label: 'Login',
        icon: 'pi pi-sign-in',
        command: () => {
          this.loginDialogVisible = true;
        },
      },
      {
        label: 'Register',
        icon: 'pi pi-user-plus',
        command: () => {
          this.registerDialogVisible = true;
        },
      },
    ];
  });

  registerDialogVisible = false;
  loginDialogVisible = false;

  dateKey(date: { year: number; month: number; day: number }): string {
    return [
      date.year,
      String(date.month + 1).padStart(2, '0'),
      String(date.day).padStart(2, '0'),
    ].join('-');
  }

  deleteAllData(): void {
    this.store.deleteAllData();
  }
}
