import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth/auth.service';

function passwordStrength(ctrl: AbstractControl) {
  const v: string = ctrl.value ?? '';
  if (!v) return null;
  if (!/[A-Z]/.test(v)) return { noUppercase: true };
  if (!/[0-9]/.test(v)) return { noNumber: true };
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  form = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrength]],
    rol: ['Cliente', Validators.required],
  });

  get f() { return this.form.controls; }
  loading = false;
  errorMsg = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';
    const { nombre, email, password, rol } = this.form.value;
    this.auth.register({ nombre: nombre!, email: email!, password: password!, rol: rol! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (e) => {
        this.errorMsg = e?.error?.title ?? 'Error al crear la cuenta.';
        this.loading = false;
      },
    });
  }
}
