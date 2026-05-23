import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../models/user.model';

export interface LoginRequest { email?: string; telefono?: string; password: string; }
export interface RegisterRequest { nombre: string; email?: string; telefonoWhatsapp?: string; password: string; rol?: string; }

/** Forma que devuelve el backend: campos del usuario directamente */
export interface AuthResult {
  id: string;
  nombre: string;
  email: string | null;
  telefonoWhatsapp: string | null;
  rol: string;
  plan: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly currentUser = signal<User | null>(null);
  readonly isAuthenticated = signal(false);

  private readonly apiUrl = `${environment.apiUrl}/auth`;

  login(payload: LoginRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/login`, payload, { withCredentials: true })
      .pipe(tap(res => this.setSession(res)));
  }

  register(payload: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/register`, payload, { withCredentials: true })
      .pipe(tap(res => this.setSession(res)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  refreshSession(): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(tap(res => this.setSession(res)));
  }

  private setSession(res: AuthResult): void {
    const user: User = {
      id: res.id,
      nombre: res.nombre,
      email: res.email,
      telefonoWhatsapp: res.telefonoWhatsapp,
      rol: res.rol as User['rol'],
      planSuscripcion: (res.plan ?? 'Gratuito') as User['planSuscripcion'],
      suscripcionVenceEn: null,
      activo: true,
    };
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
