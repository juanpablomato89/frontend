import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PedidoService } from '../../../core/services/api/pedido.service';
import { OrderSignalRService } from '../../../core/services/signalr/order-signalr.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';

const STATUS_LABELS: Record<EstadoPedido, string> = {
  Pendiente:         'Pendiente',
  Confirmado:        'Confirmado',
  EnPreparacion:     'En preparación',
  ListoParaEntregar: 'Listo',
  EnCamino:          'En camino',
  Entregado:         'Entregado',
  Cancelado:         'Cancelado',
};

const STATUS_CLASS: Record<EstadoPedido, string> = {
  Pendiente:         'badge-pending',
  Confirmado:        'badge-confirmed',
  EnPreparacion:     'badge-preparing',
  ListoParaEntregar: 'badge-ready',
  EnCamino:          'badge-transit',
  Entregado:         'badge-delivered',
  Cancelado:         'badge-cancelled',
};

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit, OnDestroy {
  private readonly pedidoService = inject(PedidoService);
  private readonly signalR = inject(OrderSignalRService);
  private readonly router = inject(Router);

  orders = signal<Pedido[]>([]);
  total = signal(0);
  page = signal(1);
  readonly pageSize = 20;
  loading = signal(true);
  error = signal('');

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.load();
    this.listenRealTime();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.pedidoService.getMisPedidos(this.page(), this.pageSize).subscribe({
      next: res => {
        this.orders.set(res.data);
        this.total.set(res.total);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar tus pedidos. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  private listenRealTime(): void {
    const sub = this.signalR.estadoCambiado$.subscribe(ev => {
      this.orders.update(list =>
        list.map(o =>
          o.id === ev.pedidoId
            ? { ...o, estado: ev.nuevoEstado as EstadoPedido }
            : o
        )
      );
    });
    this.subs.push(sub);
  }

  goToPage(p: number): void {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  totalPages(): number {
    return Math.ceil(this.total() / this.pageSize);
  }

  pages(): number[] {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  statusLabel(estado: EstadoPedido): string { return STATUS_LABELS[estado] ?? estado; }
  statusClass(estado: EstadoPedido): string { return STATUS_CLASS[estado] ?? ''; }

  viewOrder(id: string): void {
    this.router.navigate(['/orders', id]);
  }

  itemsPreview(order: Pedido): string {
    const names = order.items.slice(0, 2).map(i => i.nombre).join(', ');
    return order.items.length > 2 ? `${names}…` : names;
  }

  trackByOrder(_: number, o: Pedido): string { return o.id; }
}
