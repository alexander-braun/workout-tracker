import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideCharts(withDefaultRegisterables()),
    providePrimeNG({
      theme: {
        preset: Aura
      },
      license: 'eyJpZCI6IjRiN2M1ZThjLTU3ZmYtNDkzOS04OWZhLTJjMDc0ZWM3MDgxNyIsInByb2R1Y3QiOiJwcmltZXVpIiwidGllciI6ImNvbW11bml0eSIsInR5cGUiOiJkZXYiLCJpYXQiOjE3OTEwMjk0NTEsImV4cCI6MTgyMjU2NTQ1MX0.d7Qb_12OiTrqSWxYVWp6wR8fXd2ThhgQVi_Nht7hpKekFCrXl3zm84rXp1dRjBUqb8sy4VtkVBUNuPHgfazOBQ'
    })
  ]
};
