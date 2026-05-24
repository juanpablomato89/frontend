import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DulceriaService, DulceriaStats } from '../../../../core/services/api/dulceria.service';

@Component({
  selector: 'app-owner-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './owner-overview.component.html',
  styleUrl: './owner-overview.component.scss',
})
export class OwnerOverviewComponent implements OnInit {
  private readonly dulceriaService = inject(DulceriaService);

  stats = signal<DulceriaStats | null>(null);
  loading = signal(true);
  error = signal('');
  dulceriaId = signal<string | null>(null);

  ngOnInit(): void {
    this.dulceriaService.getMiDulceria().subscribe({
      next: d => {
        if (d) {
          this.dulceriaId.set(d.id);
          this.loadStats(d.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.error.set('No se pudo cargar la dulcería.'); this.loading.set(false); },
    });
  }

  private loadStats(id: string): void {
    this.dulceriaService.getStats(id).subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar las estadísticas.'); this.loading.set(false); },
    });
  }

  refresh(): void {
    const id = this.dulceriaId();
    if (!id) return;
    this.loading.set(true);
    this.loadStats(id);
  }
}
