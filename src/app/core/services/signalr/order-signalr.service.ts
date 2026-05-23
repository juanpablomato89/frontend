import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../../environments/environment';
import { Pedido } from '../../models/pedido.model';

export interface OrderStateChangedEvent {
  pedidoId: string;
  nuevoEstado: string;
  razon?: string;
}

@Injectable({ providedIn: 'root' })
export class OrderSignalRService implements OnDestroy {
  private hub: signalR.HubConnection;

  /** Emits when a new order is created (for dulcería owners) */
  readonly nuevoPedido$ = new Subject<Pedido>();

  /** Emits when any order status changes */
  readonly estadoCambiado$ = new Subject<OrderStateChangedEvent>();

  constructor() {
    this.hub = new signalR.HubConnectionBuilder()
      .withUrl(`${environment.apiUrl.replace('/api', '')}/hubs/orders`, {
        withCredentials: true,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hub.on('NuevoPedido', (pedido: Pedido) => this.nuevoPedido$.next(pedido));
    this.hub.on('EstadoCambiado', (e: OrderStateChangedEvent) => this.estadoCambiado$.next(e));
  }

  /** Start the hub connection (idempotent) */
  async start(): Promise<void> {
    if (this.hub.state !== signalR.HubConnectionState.Disconnected) return;
    try {
      await this.hub.start();
    } catch {
      // connection failures are retried automatically
    }
  }

  /** Stop the connection */
  async stop(): Promise<void> {
    await this.hub.stop();
  }

  /** Subscribe to notifications for a specific order */
  async joinPedidoGroup(pedidoId: string): Promise<void> {
    await this.start();
    await this.hub.invoke('JoinPedidoGroup', pedidoId);
  }

  async leavePedidoGroup(pedidoId: string): Promise<void> {
    if (this.hub.state !== signalR.HubConnectionState.Connected) return;
    await this.hub.invoke('LeavePedidoGroup', pedidoId);
  }

  /** Subscribe to all new orders for a dulcería (owner use) */
  async joinDulceriaGroup(dulceriaId: string): Promise<void> {
    await this.start();
    await this.hub.invoke('JoinDulceriaGroup', dulceriaId);
  }

  ngOnDestroy(): void {
    this.hub.stop();
    this.nuevoPedido$.complete();
    this.estadoCambiado$.complete();
  }
}
