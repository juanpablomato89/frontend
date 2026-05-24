import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DulceriaService } from '../../../../core/services/api/dulceria.service';
import { Dulceria } from '../../../../core/models/dulceria.model';

const MUNICIPIOS = [
  'Playa', 'Plaza de la Revolución', 'Centro Habana', 'La Habana Vieja',
  'Regla', 'La Habana del Este', 'Guanabacoa', 'San Miguel del Padrón',
  'Diez de Octubre', 'Cerro', 'Marianao', 'La Lisa', 'Boyeros', 'Arroyo Naranjo', 'Cotorro',
];

@Component({
  selector: 'app-owner-dulceria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './owner-dulceria.component.html',
  styleUrl: './owner-dulceria.component.scss',
})
export class OwnerDulceriaComponent implements OnInit {
  private readonly dulceriaService = inject(DulceriaService);
  private readonly fb               = inject(FormBuilder);

  dulceria  = signal<Dulceria | null>(null);
  loading   = signal(true);
  saving    = signal(false);
  error     = signal('');
  saveError = signal('');
  saved     = signal(false);

  form!: FormGroup;
  readonly municipios = MUNICIPIOS;

  ngOnInit(): void {
    this.form = this.fb.group({
      nombre:           ['', [Validators.required, Validators.maxLength(120)]],
      descripcion:      ['', Validators.maxLength(600)],
      municipio:        ['', Validators.required],
      provincia:        ['La Habana', Validators.required],
      direccionTexto:   ['', [Validators.required, Validators.maxLength(250)]],
      telefonoContacto: ['', [Validators.required, Validators.maxLength(20)]],
      tieneDelivery:    [false],
      radioDeliveryKm:  [0, Validators.min(0)],
    });

    this.dulceriaService.getMiDulceria().subscribe({
      next: d => {
        this.dulceria.set(d);
        if (d) this.patchForm(d);
        this.loading.set(false);
      },
      error: () => { this.error.set('No se pudo cargar la dulcería.'); this.loading.set(false); },
    });
  }

  private patchForm(d: Dulceria): void {
    this.form.patchValue({
      nombre:           d.nombre,
      descripcion:      d.descripcion ?? '',
      municipio:        d.municipio,
      provincia:        d.provincia,
      direccionTexto:   d.direccionTexto,
      telefonoContacto: d.telefonoContacto,
      tieneDelivery:    d.tieneDelivery,
      radioDeliveryKm:  d.radioDeliveryKm ?? 0,
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    this.saving.set(true);
    this.saveError.set('');
    this.saved.set(false);

    const v = this.form.value;
    const d = this.dulceria();

    const payload = {
      nombre:           v.nombre,
      descripcion:      v.descripcion || null,
      municipio:        v.municipio,
      provincia:        v.provincia,
      direccionTexto:   v.direccionTexto,
      telefonoContacto: v.telefonoContacto,
      tieneDelivery:    v.tieneDelivery,
      radioDeliveryKm:  +v.radioDeliveryKm || 0,
    };

    const op$ = d
      ? this.dulceriaService.update(d.id, payload)
      : this.dulceriaService.create(payload);

    op$.subscribe({
      next: updated => {
        this.dulceria.set(updated);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saveError.set('Error al guardar los cambios. Intenta de nuevo.');
        this.saving.set(false);
      },
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
