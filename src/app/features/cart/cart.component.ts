import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService, CartItem } from '../../core/services/cart/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  get items(): CartItem[] { return this.cartService.items(); }
  get subtotal(): number  { return this.cartService.subtotalUsd(); }
  get totalItems(): number { return this.cartService.totalItems(); }

  increment(item: CartItem): void {
    this.cartService.updateCantidad(item.producto.id, item.cantidad + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateCantidad(item.producto.id, item.cantidad - 1);
  }

  remove(item: CartItem): void {
    this.cartService.remove(item.producto.id);
  }

  clearAll(): void { this.cartService.clear(); }

  checkout(): void { this.router.navigate(['/checkout']); }

  continueShopping(): void { this.router.navigate(['/catalog']); }

  trackByItem(_: number, item: CartItem): string { return item.producto.id; }
}
