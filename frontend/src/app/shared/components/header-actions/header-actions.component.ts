import { Component, input, output } from '@angular/core';
import { ButtonModule, type ButtonSeverity } from 'primeng/button';

@Component({
  selector: 'frontend-header-actions',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './header-actions.component.html',
})
export class HeaderActionsComponent {
  readonly saveButtonType = input.required<'button' | 'submit'>();
  readonly hasSavedEntry = input.required<boolean>();
  readonly readyForSave = input.required<boolean>();
  readonly readyForDelete = input.required<boolean>();
  readonly saveTitle = input.required<string>();
  readonly deleteTitle = input.required<string>();

  readonly customActionTitle = input<string>();
  readonly customActionDisabled = input<boolean>();
  readonly hasCustomAction = input<boolean>(false);

  readonly delete = output<void>();
  sev: ButtonSeverity;
  readonly save = output<void>();
  readonly customAction = output<void>();

  onSaveClick(): void {
    if (this.saveButtonType() === 'button') {
      this.save.emit();
    }
  }
}
