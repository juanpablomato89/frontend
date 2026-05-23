import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../../models/producto.model';

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items = signal<CartItem[]>([]);

  readonly items = this._items.asReadonly();

  readonly totalItems = computed(() =>
    this._items().reduce((sum, i) => sum + i.cantidad, 0)
  );

  readonly subtotalUsd = computed(() =>
    this._items().reduce((sum, i) => sum + i.producto.precioUsd * i.cantidad, 0)
  );

  add(producto: Producto, cantidad = 1): void {
    this._items.update(items => {
      const existing = items.find(i => i.producto.id === producto.id);
      if (existing) {
        return items.map(i =>
          i.producto.id === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      return [...items, { producto, cantidad }];
    });
  }

  remove(productoId: string): void {
    this._items.update(items => items.filter(i => i.producto.id !== productoId));
  }

  updateCantidad(productoId: string, cantidad: number): void {
    if (cantidad <= 0) { this.remove(productoId); return; }
    this._items.update(items =>
      items.map(i => i.producto.id === productoId ? { ...i, cantidad } : i)
    );
  }

  clear(): void {
    this._items.set([]);
  }
}
