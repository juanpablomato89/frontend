import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { AdminService, UsuarioAdmin } from '../../../../core/services/api/admin.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.component.html',
  styleUrl: './admin-usuarios.component.scss',
})
export class AdminUsuariosComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly search$      = new Subject<string>();

  usuarios    = signal<UsuarioAdmin[]>([]);
  loading     = signal(true);
  error       = signal('');
  total       = signal(0);
  page        = signal(1);
  pageSize    = 20;
  search      = signal('');
  filtroRol   = signal('');
  togglingId  = signal<string | null>(null);

  readonly roles = ['', 'Admin', 'Dulceria', 'Cliente', 'Invitado'];

  ngOnInit(): void {
    this.load();
    this.search$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => { this.page.set(1); this.load(); });
  }

  load(): void {
    this.loading.set(true);
    this.adminService.getUsuarios(
      this.page(), this.pageSize,
      this.search() || undefined,
      this.filtroRol() || undefined
    ).subscribe({
      next: r => { this.usuarios.set(r.items); this.total.set(r.totalCount); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar usuarios.'); this.loading.set(false); },
    });
  }

  onSearch(val: string): void { this.search.set(val); this.search$.next(val); }
  onRolChange(): void { this.page.set(1); this.load(); }

  prevPage(): void { if (this.page() > 1) { this.page.update(p => p - 1); this.load(); } }
  nextPage(): void {
    if (this.page() * this.pageSize < this.total()) {
      this.page.update(p => p + 1); this.load();
    }
  }

  toggle(u: UsuarioAdmin): void {
    if (!confirm(`¿${u.activo ? 'Desactivar' : 'Activar'} al usuario ${u.nombre}?`)) return;
    this.togglingId.set(u.id);
    this.adminService.toggleUsuarioActivo(u.id, !u.activo).subscribe({
      next: updated => {
        this.usuarios.update(list => list.map(x => x.id === updated.id ? updated : x));
        this.togglingId.set(null);
      },
      error: () => this.togglingId.set(null),
    });
  }

  totalPages(): number { return Math.ceil(this.total() / this.pageSize); }
}
