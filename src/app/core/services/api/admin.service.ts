import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

// ── DTOs ──────────────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsuarios: number;
  totalDulcerias: number;
  dulceriasPendientes: number;
  totalPedidos: number;
  ingresosTotalUsd: number;
  tasaCambioActual: number;
}

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  email: string | null;
  telefonoWhatsapp: string | null;
  rol: string;
  planSuscripcion: string;
  activo: boolean;
  creadoEn: string;
}

export interface DulceriaAdmin {
  id: string;
  usuarioId: string;
  nombrePropietario: string;
  nombre: string;
  municipio: string;
  provincia: string;
  estaActiva: boolean;
  aprobada: boolean;
  aprobadaEn: string | null;
  creadoEn: string;
}

export interface TasaCambio {
  id: string;
  usdACup: number;
  cupAUsd: number;
  vigenteDesde: string;
  nota: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// ── Service ───────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/admin`;
  private readonly opts = { withCredentials: true };

  // Stats
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.base}/stats`, this.opts);
  }

  // Usuarios
  getUsuarios(page = 1, pageSize = 20, search?: string, rol?: string): Observable<PagedResult<UsuarioAdmin>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search) params = params.set('search', search);
    if (rol)    params = params.set('rol', rol);
    return this.http.get<PagedResult<UsuarioAdmin>>(`${this.base}/usuarios`, { params, ...this.opts });
  }

  toggleUsuarioActivo(id: string, activo: boolean): Observable<UsuarioAdmin> {
    return this.http.patch<UsuarioAdmin>(`${this.base}/usuarios/${id}/estado`, { activo }, this.opts);
  }

  // Dulcerías
  getDulcerias(page = 1, pageSize = 20, search?: string, aprobada?: boolean): Observable<PagedResult<DulceriaAdmin>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search !== undefined && search !== '') params = params.set('search', search);
    if (aprobada !== undefined)                params = params.set('aprobada', aprobada);
    return this.http.get<PagedResult<DulceriaAdmin>>(`${this.base}/dulcerias`, { params, ...this.opts });
  }

  aprobarDulceria(id: string): Observable<DulceriaAdmin> {
    return this.http.patch<DulceriaAdmin>(`${this.base}/dulcerias/${id}/aprobar`, {}, this.opts);
  }

  rechazarDulceria(id: string, motivo?: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/dulcerias/${id}/rechazar`, { motivo }, this.opts);
  }

  // Tasa de cambio
  getTasaCambio(): Observable<TasaCambio> {
    return this.http.get<TasaCambio>(`${this.base}/tasa-cambio`, this.opts);
  }

  actualizarTasaCambio(usdACup: number, nota?: string): Observable<TasaCambio> {
    return this.http.post<TasaCambio>(`${this.base}/tasa-cambio`, { usdACup, nota }, this.opts);
  }
}
