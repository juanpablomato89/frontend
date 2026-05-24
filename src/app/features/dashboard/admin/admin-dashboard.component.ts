import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent {
  private readonly authService = inject(AuthService);
  private readonly router       = inject(Router);

  readonly navItems = [
    { label: 'Resumen',        icon: 'overview',   path: 'overview'     },
    { label: 'Usuarios',       icon: 'usuarios',   path: 'usuarios'     },
    { label: 'Dulcerías',      icon: 'dulcerias',  path: 'dulcerias'    },
    { label: 'Tasa de cambio', icon: 'tasa',       path: 'tasa-cambio'  },
  ];

  get user() { return this.authService.currentUser(); }

  logout(): void { this.authService.logout(); }
}
