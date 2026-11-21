import { Component, inject, input, type InputSignal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'frontend-delete-modal',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, DialogModule, InputTextModule],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.scss',
})
export class DeleteModalComponent {
  fb = inject(FormBuilder);

  header: InputSignal<string> = input.required();
  bodyText: InputSignal<string> = input.required();
  deletionPending: InputSignal<boolean> = input.required();
  deletionError: InputSignal<string> = input('');

  hide = output<void>();
  confirmDeletion = output<void>();

  confirmationTextControl = this.fb.control('');

  onDialogVisibleChange(visible: boolean): void {
    if (!visible && !this.deletionPending()) {
      this.hide.emit();
    }
  }

  confirmDelete(): void {
    this.confirmDeletion.emit();
  }
}
