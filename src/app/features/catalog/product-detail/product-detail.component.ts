import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DulceriaService } from '../../../core/services/api/dulceria.service';
import { ProductCardComponent } from '../../../shared/components/product-card/product-card.component';
import { CartService } from '../../../core/services/cart/cart.service';
import { Dulceria } from '../../../core/models/dulceria.model';
import { Producto } from '../../../core/models/producto.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly dulceriaService = inject(DulceriaService);
  private readonly cartService = inject(CartService);

  dulceria = signal<Dulceria | null>(null);
  loading = signal(true);
  error = signal('');
  addedProductId = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.dulceriaService.getById(id).subscribe({
      next: d => { this.dulceria.set(d); this.loading.set(false); },
      error: () => { this.error.set('No se pudo cargar esta dulcería.'); this.loading.set(false); },
    });
  }

  addToCart(producto: Producto): void {
    this.cartService.add(producto);
    this.addedProductId.set(producto.id);
    setTimeout(() => this.addedProductId.set(null), 2000);
  }

  get productos(): Producto[] {
    return (this.dulceria() as any)?.productos ?? [];
  }

  trackByProducto(_: number, p: Producto): string { return p.id; }
}
