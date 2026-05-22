import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../models/user.model';

interface LoginRequest { email?: string; telefono?: string; password: string; }
interface RegisterRequest { nombre: string; email?: string; telefonoWhatsapp?: string; password: string; }
interface AuthResult { user: User; }

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
      .pipe(tap(res => this.setSession(res.user)));
  }

  register(payload: RegisterRequest): Observable<AuthResult> {
    return this.http
      .post<AuthResult>(`${this.apiUrl}/register`, payload, { withCredentials: true })
      .pipe(tap(res => this.setSession(res.user)));
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
      .pipe(tap(res => this.setSession(res.user)));
  }

  private setSession(user: User): void {
    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }
}
