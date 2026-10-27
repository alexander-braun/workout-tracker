import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from './features/auth/store/auth.store';

@Component({
  selector: 'frontend-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  private readonly authStore = inject(AuthStore);

  constructor() {
    this.authStore.loadCurrentUser();
  }
}
