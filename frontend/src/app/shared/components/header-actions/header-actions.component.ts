import { Component, input, output } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'frontend-header-actions',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './header-actions.component.html',
  styleUrl: './header-actions.component.scss',
})
export class HeaderActionsComponent {
  readonly hasSavedEntry = input.required<boolean>();
  readonly readyForSave = input.required<boolean>();
  readonly readyForDelete = input.required<boolean>();
  readonly saveTitle = input.required<string>();
  readonly deleteTitle = input.required<string>();

  readonly delete = output<void>();
  readonly save = output<void>();
}
