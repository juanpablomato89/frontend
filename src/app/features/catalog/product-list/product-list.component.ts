import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DulceriaService } from '../../../core/services/api/dulceria.service';
import { DulceriaCardComponent } from '../../../shared/components/dulceria-card/dulceria-card.component';
import { Dulceria } from '../../../core/models/dulceria.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DulceriaCardComponent],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly dulceriaService = inject(DulceriaService);

  dulcerias = signal<Dulceria[]>([]);
  loading = signal(true);
  error = signal('');
  total = signal(0);
  page = signal(1);
  readonly pageSize = 16;

  municipioFilter = '';
  provinciaFilter = '';

  readonly provincias = [
    'Pinar del Río','Artemisa','La Habana','Mayabeque','Matanzas',
    'Cienfuegos','Villa Clara','Sancti Spíritus','Ciego de Ávila',
    'Camagüey','Las Tunas','Holguín','Granma','Santiago de Cuba',
    'Guantánamo','Isla de la Juventud',
  ];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.dulceriaService
      .getAll(this.page(), this.pageSize, this.municipioFilter || undefined)
      .subscribe({
        next: res => {
          this.dulcerias.set(res.data);
          this.total.set(res.total);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el catalogo. Intenta de nuevo.');
          this.loading.set(false);
        },
      });
  }

  applyFilter(): void {
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.municipioFilter = '';
    this.provinciaFilter = '';
    this.applyFilter();
  }

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  trackByDulceria(_: number, d: Dulceria): string { return d.id; }
}
