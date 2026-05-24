import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Dulceria } from '../../models/dulceria.model';
import { PagedResponse } from '../../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class DulceriaService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dulcerias`;

  getAll(page = 1, pageSize = 20, municipio?: string): Observable<PagedResponse<Dulceria>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (municipio) params = params.set('municipio', municipio);
    return this.http.get<PagedResponse<Dulceria>>(this.apiUrl, { params });
  }

  getById(id: string): Observable<Dulceria> {
    return this.http.get<Dulceria>(`${this.apiUrl}/${id}`);
  }

  create(data: Partial<Dulceria>): Observable<Dulceria> {
    return this.http.post<Dulceria>(this.apiUrl, data, { withCredentials: true });
  }

  update(id: string, data: Partial<Dulceria>): Observable<Dulceria> {
    return this.http.put<Dulceria>(`${this.apiUrl}/${id}`, data, { withCredentials: true });
  }

  getMiDulceria(): Observable<Dulceria | null> {
    return this.http.get<Dulceria | null>(`${this.apiUrl}/mi-dulceria`, { withCredentials: true });
  }

  getStats(id: string): Observable<DulceriaStats> {
    return this.http.get<DulceriaStats>(`${this.apiUrl}/${id}/stats`, { withCredentials: true });
  }
}

export interface DulceriaStats {
  pedidosHoy: number;
  pedidosPendientes: number;
  pedidosEsteMes: number;
  ingresosMesUsd: number;
  ingresosTotalUsd: number;
  ratingPromedio: number;
  totalResenas: number;
}
