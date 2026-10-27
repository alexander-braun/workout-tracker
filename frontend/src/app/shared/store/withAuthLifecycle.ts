import { effect, inject, untracked } from '@angular/core';
import { withHooks } from '@ngrx/signals';
import { AuthStore } from '../../features/auth/store/auth.store';

export function withAuthLifecycle(
  clearStore: () => void,
  loadData: () => void,
) {
  return withHooks({
    onInit() {
      const authStore = inject(AuthStore);

      effect(() => {
        if (!authStore.initialized()) return;

        if (authStore.authenticated()) {
          untracked(() => loadData());
        } else {
          untracked(() => clearStore());
        }
      });
    },
  });
}