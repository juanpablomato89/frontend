import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  @Input({ required: true }) producto!: Producto;
  @Output() addToCart = new EventEmitter<Producto>();

  onAdd(): void {
    this.addToCart.emit(this.producto);
  }
}
