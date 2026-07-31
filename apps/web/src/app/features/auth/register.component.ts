import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(1)]],
    businessName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const value = this.form.getRawValue();
    try {
      await this.auth.register({
        name: value.name,
        email: value.email,
        password: value.password,
        businessName: value.businessName || undefined,
      });
      void this.router.navigateByUrl('/app');
    } catch (err: unknown) {
      const e = err as { error?: { message?: string | string[] } };
      const msg = e?.error?.message;
      this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Unable to create account');
    } finally {
      this.loading.set(false);
    }
  }
}
