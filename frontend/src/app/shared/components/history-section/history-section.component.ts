import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChild, input, signal, TemplateRef } from '@angular/core';

@Component({
  selector: 'frontend-history-section',
  standalone: true,
  templateUrl: './history-section.component.html',
  styleUrl: './history-section.component.scss',
  imports: [NgTemplateOutlet],
})
export class HistorySectionComponent {
    readonly title = input.required<string>();
    readonly historyOpen = signal(false);
    readonly historyTemplate = contentChild.required(TemplateRef);
}
