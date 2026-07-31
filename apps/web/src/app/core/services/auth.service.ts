import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthResponse, User } from '../models';

const TOKEN_KEY = 'forgeledger_token';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toPromise<T>(obs: { subscribe: (handlers: any) => void }): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    obs.subscribe({ next: resolve, error: reject });
  });
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly userSignal = signal<User | null>(null);
  private readonly readySignal = signal(false);

  readonly user = this.userSignal.asReadonly();
  readonly ready = this.readySignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.userSignal());

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  async bootstrap(): Promise<void> {
    const token = this.token;
    if (!token) {
      this.readySignal.set(true);
      return;
    }
    try {
      const user = await toPromise<User>(this.api.me());
      this.userSignal.set(user);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      this.userSignal.set(null);
    } finally {
      this.readySignal.set(true);
    }
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await toPromise<AuthResponse>(this.api.login(email, password));
    this.persist(res.accessToken, res.user);
    return res;
  }

  async register(payload: {
    email: string;
    password: string;
    name: string;
    businessName?: string;
  }): Promise<AuthResponse> {
    const res = await toPromise<AuthResponse>(this.api.register(payload));
    this.persist(res.accessToken, res.user);
    return res;
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.userSignal.set(null);
    void this.router.navigateByUrl('/login');
  }

  private persist(token: string, user: User) {
    localStorage.setItem(TOKEN_KEY, token);
    this.userSignal.set(user);
    this.readySignal.set(true);
  }
}
