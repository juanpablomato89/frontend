import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DulceriaService } from '../../../../core/services/api/dulceria.service';
import { PedidoService } from '../../../../core/services/api/pedido.service';
import { OrderSignalRService } from '../../../../core/services/signalr/order-signalr.service';
import { Pedido, EstadoPedido } from '../../../../core/models/pedido.model';

const ESTADOS: EstadoPedido[] = [
  'Buscando', 'Aceptado', 'Preparando',
  'Listo', 'EnCamino', 'Entregado', 'Cancelado',
];

const NEXT_STATE: Partial<Record<EstadoPedido, EstadoPedido>> = {
  Buscando:  'Aceptado',
  Aceptado:  'Preparando',
  Preparando: 'Listo',
  Listo:     'EnCamino',
  EnCamino:  'Entregado',
};

const LABEL_MAP: Record<EstadoPedido, string> = {
  Buscando:  'Buscando',
  Aceptado:  'Aceptado',
  Preparando: 'En preparación',
  Listo:     'Listo para entregar',
  EnCamino:  'En camino',
  Entregado: 'Entregado',
  Cancelado: 'Cancelado',
};

@Component({
  selector: 'app-owner-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './owner-pedidos.component.html',
  styleUrl: './owner-pedidos.component.scss',
})
export class OwnerPedidosComponent implements OnInit, OnDestroy {
  private readonly dulceriaService = inject(DulceriaService);
  private readonly pedidoService   = inject(PedidoService);
  private readonly signalR         = inject(OrderSignalRService);
  private readonly destroy$        = new Subject<void>();

  pedidos     = signal<Pedido[]>([]);
  loading     = signal(true);
  error       = signal('');
  dulceriaId  = signal<string | null>(null);
  filtroEstado = signal<string>('');
  updatingId  = signal<string | null>(null);

  readonly estadosFiltro = ['', ...ESTADOS];
  readonly nextState = NEXT_STATE;
  readonly labelMap  = LABEL_MAP;

  ngOnInit(): void {
    this.dulceriaService.getMiDulceria().subscribe({
      next: d => {
        if (d) {
          this.dulceriaId.set(d.id);
          this.loadPedidos(d.id);
          this.subscribeSignalR(d.id);
        } else {
          this.loading.set(false);
        }
      },
      error: () => { this.error.set('Error al cargar dulcería.'); this.loading.set(false); },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPedidos(id: string): void {
    this.loading.set(true);
    const estado = this.filtroEstado() || undefined;
    this.pedidoService.getByDulceria(id, 1, 50, estado).subscribe({
      next: r => { this.pedidos.set(r.items); this.loading.set(false); },
      error: () => { this.error.set('No se pudieron cargar los pedidos.'); this.loading.set(false); },
    });
  }

  private subscribeSignalR(dulceriaId: string): void {
    this.signalR.joinDulceriaGroup(dulceriaId);

    this.signalR.nuevoPedido$
      .pipe(takeUntil(this.destroy$))
      .subscribe(p => {
        this.pedidos.update(list => [p, ...list]);
      });

    this.signalR.estadoCambiado$
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ pedidoId, nuevoEstado }) => {
        this.pedidos.update(list =>
          list.map(p => p.id === pedidoId ? { ...p, estado: nuevoEstado as EstadoPedido } : p)
        );
      });
  }

  applyFilter(): void {
    const id = this.dulceriaId();
    if (id) this.loadPedidos(id);
  }

  avanzarEstado(pedido: Pedido): void {
    const next = NEXT_STATE[pedido.estado];
    if (!next) return;
    this.updatingId.set(pedido.id);
    this.pedidoService.cambiarEstado(pedido.id, next).subscribe({
      next: updated => {
        this.pedidos.update(list => list.map(p => p.id === updated.id ? updated : p));
        this.updatingId.set(null);
      },
      error: () => this.updatingId.set(null),
    });
  }

  estadoLabel(e: EstadoPedido): string { return LABEL_MAP[e] ?? e; }
  itemsResumen(p: Pedido): string {
    return p.items.slice(0, 2).map(i => `${i.cantidad}× ${i.nombre}`).join(', ')
      + (p.items.length > 2 ? ` +${p.items.length - 2} más` : '');
  }
}
