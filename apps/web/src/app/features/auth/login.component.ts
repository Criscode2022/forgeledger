import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['demo@forgeledger.app', [Validators.required, Validators.email]],
    password: ['demo1234', [Validators.required, Validators.minLength(8)]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email, password);
      void this.router.navigateByUrl('/app');
    } catch (err: unknown) {
      const e = err as { error?: { message?: string | string[] } };
      const msg = e?.error?.message;
      this.error.set(Array.isArray(msg) ? msg.join(', ') : msg || 'Unable to sign in');
    } finally {
      this.loading.set(false);
    }
  }
}
