import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';
import { DulceriaService } from '../../../core/services/api/dulceria.service';
import { Dulceria } from '../../../core/models/dulceria.model';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.scss',
})
export class OwnerDashboardComponent implements OnInit {
  private readonly dulceriaService = inject(DulceriaService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  dulceria = signal<Dulceria | null>(null);
  loadingDulceria = signal(true);

  readonly navItems = [
    { label: 'Resumen',   icon: 'overview',   path: 'overview'  },
    { label: 'Pedidos',   icon: 'pedidos',    path: 'pedidos'   },
    { label: 'Productos', icon: 'productos',  path: 'productos' },
    { label: 'Mi dulcería', icon: 'dulceria', path: 'dulceria'  },
  ];

  ngOnInit(): void {
    this.dulceriaService.getMiDulceria().subscribe({
      next: d => { this.dulceria.set(d); this.loadingDulceria.set(false); },
      error: () => this.loadingDulceria.set(false),
    });
  }

  get user() { return this.authService.currentUser(); }

  logout(): void { this.authService.logout(); }
}
