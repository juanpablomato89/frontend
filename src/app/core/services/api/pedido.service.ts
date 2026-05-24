import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Pedido } from '../../models/pedido.model';

/** Matches QueDulce.Shared.PagedResult<T> serialised by .NET */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreatePedidoRequest {
  idempotencyKey: string;
  dulceriaId: string;
  items: { productoId: string; cantidad: number }[];
  tipoEntrega: 'Delivery' | 'Recogida';
  direccionEntregaTexto?: string;
  entregaLatitud?: number;
  entregaLongitud?: number;
  nombreInvitado?: string;
  telefonoInvitado?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/pedidos`;

  create(request: CreatePedidoRequest): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, request, { withCredentials: true });
  }

  getMisPedidos(page = 1, pageSize = 20): Observable<PagedResult<Pedido>> {
    return this.http.get<PagedResult<Pedido>>(`${this.apiUrl}/mis-pedidos`, {
      params: { page, pageSize },
      withCredentials: true,
    });
  }

  getById(id: string): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  cancelar(id: string, razon: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/cancelar`, { razon }, { withCredentials: true });
  }

  calificar(id: string, rating: number, comentario?: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/calificar`, { rating, comentario }, { withCredentials: true });
  }

  // ── Owner methods ────────────────────────────────────────────────────────
  getByDulceria(
    dulceriaId: string,
    page = 1,
    pageSize = 30,
    estado?: string
  ): Observable<PagedResult<Pedido>> {
    const params: Record<string, string | number> = { page, pageSize };
    if (estado) params['estado'] = estado;
    return this.http.get<PagedResult<Pedido>>(
      `${environment.apiUrl}/dulcerias/${dulceriaId}/pedidos`,
      { params, withCredentials: true }
    );
  }

  cambiarEstado(id: string, nuevoEstado: string): Observable<Pedido> {
    return this.http.patch<Pedido>(
      `${this.apiUrl}/${id}/estado`,
      { estado: nuevoEstado },
      { withCredentials: true }
    );
  }
}
