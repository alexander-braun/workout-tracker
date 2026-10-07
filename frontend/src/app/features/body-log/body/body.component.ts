import { Component, input } from '@angular/core';

export type BodyArea = 'body' | 'neck' | 'chest' | 'biceps' | 'waist' | 'thigh' | 'calf' | null;

@Component({
  selector: 'frontend-body',
  standalone: true,
  imports: [],
  templateUrl: './body.component.html',
  styleUrl: './body.component.scss',
})
export class BodyComponent {
  readonly focusOn = input<BodyArea>(null);
  readonly isLoading = input<boolean>(false);
}
