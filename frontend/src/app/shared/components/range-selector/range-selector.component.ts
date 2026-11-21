import {
  Component,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { type Range } from '../../types/range.model';

@Component({
  selector: 'frontend-range-selector',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
  ],
  templateUrl: './range-selector.component.html',
  styleUrl: './range-selector.component.scss',
})
export class RangeSelectorComponent {
 ranges = input.required<Range[]>();
 selectedRange = input.required<Range>();

 selectedChange = output<Range>();
}
