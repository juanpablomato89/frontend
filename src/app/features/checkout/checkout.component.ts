import { Component, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../core/services/cart/cart.service';
import { PedidoService, CreatePedidoRequest } from '../../core/services/api/pedido.service';
import { AuthService } from '../../core/services/auth/auth.service';

function generateIdempotencyKey(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly cartService = inject(CartService);
  private readonly pedidoService = inject(PedidoService);
  readonly authService = inject(AuthService);

  submitting = signal(false);
  error = signal('');

  form!: FormGroup;

  ngOnInit(): void {
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.form = this.fb.group({
      tipoEntrega: ['Delivery', Validators.required],
      direccionEntregaTexto: [''],
      // Guest fields (only shown when not authenticated)
      nombreInvitado: [''],
      telefonoInvitado: [''],
    });

    // Conditional validation when delivery type changes
    this.form.get('tipoEntrega')!.valueChanges.subscribe(v => {
      const dir = this.form.get('direccionEntregaTexto')!;
      if (v === 'Delivery') {
        dir.setValidators([Validators.required, Validators.minLength(10)]);
      } else {
        dir.clearValidators();
      }
      dir.updateValueAndValidity();
    });

    // Trigger initial validation state
    this.form.get('tipoEntrega')!.updateValueAndValidity({ emitEvent: true });

    // Guest validators when user is not authenticated
    if (!this.authService.isAuthenticated()) {
      this.form.get('nombreInvitado')!.setValidators([Validators.required, Validators.minLength(2)]);
      this.form.get('telefonoInvitado')!.setValidators([Validators.required, Validators.minLength(7)]);
    }
  }

  get isDelivery(): boolean {
    return this.form?.get('tipoEntrega')?.value === 'Delivery';
  }

  get isGuest(): boolean {
    return !this.authService.isAuthenticated();
  }

  get items() { return this.cartService.items(); }
  get subtotal() { return this.cartService.subtotalUsd(); }

  /** Group items by dulcería — backend validates they all belong to the same dulcería */
  get dulceriaId(): string | null {
    return (this.items[0]?.producto as any)?.dulceriaId ?? null;
  }

  submit(): void {
    if (this.form.invalid || this.submitting()) return;

    const v = this.form.value;
    const payload: CreatePedidoRequest = {
      idempotencyKey: generateIdempotencyKey(),
      dulceriaId: this.dulceriaId ?? '',
      items: this.items.map(i => ({ productoId: i.producto.id, cantidad: i.cantidad })),
      tipoEntrega: v.tipoEntrega,
      direccionEntregaTexto: v.tipoEntrega === 'Delivery' ? v.direccionEntregaTexto : undefined,
      nombreInvitado: this.isGuest ? v.nombreInvitado : undefined,
      telefonoInvitado: this.isGuest ? v.telefonoInvitado : undefined,
    };

    this.submitting.set(true);
    this.error.set('');

    this.pedidoService.create(payload).subscribe({
      next: pedido => {
        this.cartService.clear();
        this.router.navigate(['/orders', pedido.id]);
      },
      error: err => {
        const msg = err?.error?.detail ?? err?.error?.title ?? 'No se pudo crear el pedido. Intenta de nuevo.';
        this.error.set(msg);
        this.submitting.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  trackByItem(_: number, item: any): string { return item.producto.id; }
}
