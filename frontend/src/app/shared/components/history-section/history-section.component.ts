import { Component, input, model } from '@angular/core';

@Component({
  selector: 'frontend-history-section',
  standalone: true,
  templateUrl: './history-section.component.html',
  styleUrl: './history-section.component.scss',
})
export class HistorySectionComponent {
    title = input.required<string>();
    historyOpen = model.required<boolean>();
}
