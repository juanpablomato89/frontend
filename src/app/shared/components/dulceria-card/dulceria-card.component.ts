import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Dulceria } from '../../../core/models/dulceria.model';

@Component({
  selector: 'app-dulceria-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dulceria-card.component.html',
  styleUrl: './dulceria-card.component.scss',
})
export class DulceriaCardComponent {
  @Input({ required: true }) dulceria!: Dulceria;
}
