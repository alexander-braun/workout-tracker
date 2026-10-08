import { type Routes } from '@angular/router';
import { userGuard } from './user.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./features/account/account.component').then((m) => m.AccountComponent),
    canActivate: [userGuard]
  },
  { path: '**', redirectTo: '' },
];
