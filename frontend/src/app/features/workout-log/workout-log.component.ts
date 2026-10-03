import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'frontend-workout-log',
  standalone: true,
  imports: [
    FormsModule,
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './workout-log.component.html',
  styleUrl: './workout-log.component.scss',
})
export class WorkoutLogComponent {
  exerciseOptions = [
    'Ring Rows',
    'Scapular Push-ups',
    'Biceps Curls',
    'Band External Rotation',
    'Crunches',
  ];

  unitOptions = ['BW', 'kg', 'lbs'];

  rows = [
    {
      exercise: 'Ring Rows',
      sets: 3,
      reps: 9,
      weight: null,
      unit: 'BW',
      notes: 'felt good',
    },
    {
      exercise: 'Scapular Push-ups',
      sets: 3,
      reps: 15,
      weight: null,
      unit: 'BW',
      notes: '',
    },
    {
      exercise: 'Biceps Curls',
      sets: 3,
      reps: 10,
      weight: 5,
      unit: 'kg',
      notes: '',
    },
    {
      exercise: 'Band External Rotation',
      sets: 3,
      reps: 9,
      weight: 13.6,
      unit: 'kg',
      notes: '',
    },
    {
      exercise: 'Crunches',
      sets: 3,
      reps: 11,
      weight: null,
      unit: 'BW',
      notes: 'better control',
    },
  ];
}