import { Component } from '@angular/core';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'frontend-button',
  template: `
    <button pButton>Check</button>
  `,
  imports: [ButtonDirective],
})
export class Button {}
