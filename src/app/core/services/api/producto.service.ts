import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Producto } from '../../models/producto.model';

export interface CreateProductoRequest {
  dulceriaId: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  precioUsd: number;
  stock: number;
  disponible?: boolean;
}

export interface UpdateProductoRequest {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precioUsd?: number;
  stock?: number;
  disponible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  getByDulceria(dulceriaId: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${environment.apiUrl}/dulcerias/${dulceriaId}/productos`);
  }

  create(request: CreateProductoRequest): Observable<Producto> {
    return this.http.post<Producto>(this.apiUrl, request, { withCredentials: true });
  }

  update(id: string, request: UpdateProductoRequest): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}`, request, { withCredentials: true });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  toggleDisponible(id: string, disponible: boolean): Observable<Producto> {
    return this.http.patch<Producto>(
      `${this.apiUrl}/${id}/disponibilidad`,
      { disponible },
      { withCredentials: true }
    );
  }
}
