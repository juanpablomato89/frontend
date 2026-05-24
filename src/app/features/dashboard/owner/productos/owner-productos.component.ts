import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DulceriaService } from '../../../../core/services/api/dulceria.service';
import { ProductoService, CreateProductoRequest, UpdateProductoRequest } from '../../../../core/services/api/producto.service';
import { Producto } from '../../../../core/models/producto.model';

type ModalMode = 'create' | 'edit' | null;

@Component({
  selector: 'app-owner-productos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './owner-productos.component.html',
  styleUrl: './owner-productos.component.scss',
})
export class OwnerProductosComponent implements OnInit {
  private readonly dulceriaService = inject(DulceriaService);
  private readonly productoService  = inject(ProductoService);
  private readonly fb                = inject(FormBuilder);

  productos    = signal<Producto[]>([]);
  loading      = signal(true);
  error        = signal('');
  dulceriaId   = signal<string | null>(null);
  modalMode    = signal<ModalMode>(null);
  editingId    = signal<string | null>(null);
  saving       = signal(false);
  deletingId   = signal<string | null>(null);
  togglingId   = signal<string | null>(null);
  saveError    = signal('');

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre:      ['', [Validators.required, Validators.maxLength(120)]],
      descripcion: ['', Validators.maxLength(500)],
      categoria:   [''],
      precioUsd:   [null, [Validators.required, Validators.min(0.01)]],
      stock:       [0,    [Validators.required, Validators.min(0)]],
      disponible:  [true],
    });

    this.dulceriaService.getMiDulceria().subscribe({
      next: d => {
        if (d) {
          this.dulceriaId.set(d.id);
          this.loadProductos(d.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.error.set('Error al cargar dulcería.'); this.loading.set(false); },
    });
  }

  private loadProductos(id: string): void {
    this.loading.set(true);
    this.productoService.getByDulceria(id).subscribe({
      next: list => { this.productos.set(list); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar los productos.'); this.loading.set(false); },
    });
  }

  openCreate(): void {
    this.form.reset({ disponible: true, stock: 0 });
    this.editingId.set(null);
    this.saveError.set('');
    this.modalMode.set('create');
  }

  openEdit(p: Producto): void {
    this.form.setValue({
      nombre:      p.nombre,
      descripcion: p.descripcion ?? '',
      categoria:   p.categoria ?? '',
      precioUsd:   p.precioUsd,
      stock:       p.stock,
      disponible:  p.disponible,
    });
    this.editingId.set(p.id);
    this.saveError.set('');
    this.modalMode.set('edit');
  }

  closeModal(): void {
    this.modalMode.set(null);
    this.saveError.set('');
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saveError.set('');

    const v = this.form.value;

    if (this.modalMode() === 'create') {
      const req: CreateProductoRequest = {
        dulceriaId: this.dulceriaId()!,
        nombre:      v.nombre,
        descripcion: v.descripcion || undefined,
        categoria:   v.categoria || undefined,
        precioUsd:   +v.precioUsd,
        stock:       +v.stock,
        disponible:  v.disponible,
      };
      this.productoService.create(req).subscribe({
        next: p => {
          this.productos.update(list => [p, ...list]);
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.saveError.set('Error al crear el producto.');
          this.saving.set(false);
        },
      });
    } else {
      const req: UpdateProductoRequest = {
        nombre:      v.nombre,
        descripcion: v.descripcion || undefined,
        categoria:   v.categoria || undefined,
        precioUsd:   +v.precioUsd,
        stock:       +v.stock,
        disponible:  v.disponible,
      };
      this.productoService.update(this.editingId()!, req).subscribe({
        next: updated => {
          this.productos.update(list => list.map(p => p.id === updated.id ? updated : p));
          this.closeModal();
          this.saving.set(false);
        },
        error: () => {
          this.saveError.set('Error al actualizar el producto.');
          this.saving.set(false);
        },
      });
    }
  }

  toggleDisponible(p: Producto): void {
    this.togglingId.set(p.id);
    this.productoService.toggleDisponible(p.id, !p.disponible).subscribe({
      next: updated => {
        this.productos.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.togglingId.set(null);
      },
      error: () => this.togglingId.set(null),
    });
  }

  deleteProducto(id: string): void {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return;
    this.deletingId.set(id);
    this.productoService.delete(id).subscribe({
      next: () => {
        this.productos.update(list => list.filter(p => p.id !== id));
        this.deletingId.set(null);
      },
      error: () => this.deletingId.set(null),
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
