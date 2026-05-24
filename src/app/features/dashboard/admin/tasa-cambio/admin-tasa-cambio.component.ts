import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService, TasaCambio } from '../../../../core/services/api/admin.service';

@Component({
  selector: 'app-admin-tasa-cambio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-tasa-cambio.component.html',
  styleUrl: './admin-tasa-cambio.component.scss',
})
export class AdminTasaCambioComponent implements OnInit {
  private readonly adminService = inject(AdminService);
  private readonly fb            = inject(FormBuilder);

  tasa      = signal<TasaCambio | null>(null);
  loading   = signal(true);
  saving    = signal(false);
  error     = signal('');
  saveError = signal('');
  saved     = signal(false);

  form = this.fb.group({
    usdACup: [null as number | null, [Validators.required, Validators.min(1), Validators.max(10000)]],
    nota:    ['', Validators.maxLength(200)],
  });

  ngOnInit(): void {
    this.adminService.getTasaCambio().subscribe({
      next: t => { this.tasa.set(t); this.loading.set(false); },
      error: () => { this.loading.set(false); }, // no tasa yet — form starts empty
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const { usdACup, nota } = this.form.value;
    if (!usdACup) return;

    this.saving.set(true);
    this.saveError.set('');
    this.saved.set(false);

    this.adminService.actualizarTasaCambio(+usdACup, nota || undefined).subscribe({
      next: t => {
        this.tasa.set(t);
        this.form.reset();
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saveError.set('Error al actualizar la tasa. Intenta de nuevo.');
        this.saving.set(false);
      },
    });
  }

  get cupPreview(): number {
    const v = this.form.get('usdACup')?.value;
    return v ? Math.round(+v * 100) / 100 : 0;
  }
}
