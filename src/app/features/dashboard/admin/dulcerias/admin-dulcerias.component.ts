import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, DulceriaAdmin } from '../../../../core/services/api/admin.service';

@Component({
  selector: 'app-admin-dulcerias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dulcerias.component.html',
  styleUrl: './admin-dulcerias.component.scss',
})
export class AdminDulceriasComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly search$      = new Subject<string>();

  dulcerias   = signal<DulceriaAdmin[]>([]);
  loading     = signal(true);
  error       = signal('');
  total       = signal(0);
  page        = signal(1);
  pageSize    = 20;
  search      = signal('');
  filtroAp    = signal<string>('');   // '' | 'true' | 'false'
  actionId    = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.page.set(1); this.load(); });
  }

  load(): void {
    this.loading.set(true);
    const aprobada = this.filtroAp() === '' ? undefined
      : this.filtroAp() === 'true';
    this.adminService.getDulcerias(
      this.page(), this.pageSize,
      this.search() || undefined,
      aprobada
    ).subscribe({
      next: r => { this.dulcerias.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar dulcerías.'); this.loading.set(false); },
    });
  }

  onSearch(val: string): void { this.search.set(val); this.search$.next(val); }
  onFilterChange(): void { this.page.set(1); this.load(); }

  aprobar(d: DulceriaAdmin): void {
    if (!confirm(`¿Aprobar la dulcería "${d.nombre}"?`)) return;
    this.actionId.set(d.id);
    this.adminService.aprobarDulceria(d.id).subscribe({
      next: updated => {
        this.dulcerias.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.actionId.set(null);
      },
      error: () => this.actionId.set(null),
    });
  }

  rechazar(d: DulceriaAdmin): void {
    const motivo = prompt(`Motivo para rechazar "${d.nombre}" (opcional):`);
    if (motivo === null) return; // cancelled
    this.actionId.set(d.id);
    this.adminService.rechazarDulceria(d.id, motivo || undefined).subscribe({
      next: () => {
        this.dulcerias.update(list =>
          list.map(x => x.id === d.id ? { ...x, aprobada: false, estaActiva: false } : x)
        );
        this.actionId.set(null);
      },
      error: () => this.actionId.set(null),
    });
  }

  prevPage(): void { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void {
    if (this.page() * this.pageSize < this.total()) {
      this.page.update(p => p + 1); this.load();
    }
  }
  totalPages(): number { return Math.ceil(this.total() / this.pageSize); }
}
