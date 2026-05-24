import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { PedidoService } from '../../../core/services/api/pedido.service';
import { OrderSignalRService } from '../../../core/services/signalr/order-signalr.service';
import { AuthService } from '../../../core/services/auth/auth.service';
import { Pedido, EstadoPedido } from '../../../core/models/pedido.model';

export interface TimelineStep {
  estado: EstadoPedido;
  label: string;
  icon: string;
  reached: boolean;
  current: boolean;
}

const TIMELINE_STATES: { estado: EstadoPedido; label: string }[] = [
  { estado: 'Buscando',   label: 'Pedido enviado' },
  { estado: 'Aceptado',   label: 'Confirmado' },
  { estado: 'Preparando', label: 'En preparación' },
  { estado: 'Listo',      label: 'Listo' },
  { estado: 'EnCamino',   label: 'En camino' },
  { estado: 'Entregado',  label: 'Entregado' },
];

const STATE_ORDER: Record<EstadoPedido, number> = {
  Buscando: 0, Aceptado: 1, Preparando: 2,
  Listo: 3, EnCamino: 4, Entregado: 5, Cancelado: -1,
};

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidoService = inject(PedidoService);
  private readonly signalR = inject(OrderSignalRService);
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  order = signal<Pedido | null>(null);
  loading = signal(true);
  error = signal('');
  cancelling = signal(false);
  cancelError = signal('');
  ratingSubmitting = signal(false);
  ratingDone = signal(false);

  ratingForm!: FormGroup;
  hoverRating = signal(0);

  private subs: Subscription[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;

    this.ratingForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', Validators.maxLength(300)],
    });

    this.pedidoService.getById(id).subscribe({
      next: o => {
        this.order.set(o);
        this.loading.set(false);
        if (o.rating) this.ratingDone.set(true);
        this.listenRealTime(id);
      },
      error: () => {
        this.error.set('No se pudo cargar el pedido.');
        this.loading.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    const o = this.order();
    if (o) this.signalR.leavePedidoGroup(o.id);
    this.subs.forEach(s => s.unsubscribe());
  }

  private async listenRealTime(pedidoId: string): Promise<void> {
    await this.signalR.joinPedidoGroup(pedidoId);
    const sub = this.signalR.estadoCambiado$.subscribe(ev => {
      if (ev.pedidoId !== pedidoId) return;
      this.order.update(o => o ? { ...o, estado: ev.nuevoEstado as EstadoPedido } : o);
    });
    this.subs.push(sub);
  }

  get timeline(): TimelineStep[] {
    const current = this.order()?.estado;
    if (!current) return [];
    const currentIdx = STATE_ORDER[current] ?? -1;

    return TIMELINE_STATES.map(step => ({
      estado: step.estado,
      label: step.label,
      icon: step.estado,
      reached: STATE_ORDER[step.estado] <= currentIdx,
      current: step.estado === current,
    }));
  }

  get isCancellable(): boolean {
    const o = this.order();
    if (!o) return false;
    return o.estado === 'Buscando' || o.estado === 'Aceptado';
  }

  get isDeliverable(): boolean {
    return this.order()?.estado === 'Entregado' && !this.ratingDone();
  }

  setRating(value: number): void {
    this.ratingForm.patchValue({ rating: value });
  }

  submitRating(): void {
    if (this.ratingForm.invalid || this.ratingSubmitting()) return;
    const o = this.order()!;
    const { rating, comentario } = this.ratingForm.value;

    this.ratingSubmitting.set(true);
    this.pedidoService.calificar(o.id, rating, comentario || undefined).subscribe({
      next: () => {
        this.ratingDone.set(true);
        this.ratingSubmitting.set(false);
        this.order.update(ord => ord ? { ...ord, rating, comentarioRating: comentario } : ord);
      },
      error: () => { this.ratingSubmitting.set(false); },
    });
  }

  cancelOrder(): void {
    const o = this.order();
    if (!o || this.cancelling()) return;
    this.cancelling.set(true);
    this.cancelError.set('');
    this.pedidoService.cancelar(o.id, 'Cancelado por el cliente').subscribe({
      next: () => {
        this.order.update(ord => ord ? { ...ord, estado: 'Cancelado' } : ord);
        this.cancelling.set(false);
      },
      error: err => {
        this.cancelError.set(err?.error?.detail ?? 'No se pudo cancelar el pedido.');
        this.cancelling.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  trackByItem(_: number, item: any): string { return item.productoId; }
}
