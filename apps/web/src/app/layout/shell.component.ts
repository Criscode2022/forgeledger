import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  readonly menuOpen = signal(false);

  readonly nav = [
    { path: '/app', label: 'Overview', exact: true, icon: 'overview' },
    { path: '/app/clients', label: 'Clients', exact: false, icon: 'clients' },
    { path: '/app/projects', label: 'Projects', exact: false, icon: 'projects' },
    { path: '/app/invoices', label: 'Invoices', exact: false, icon: 'invoices' },
    { path: '/app/expenses', label: 'Expenses', exact: false, icon: 'expenses' },
  ];

  toggleMenu() {
    this.menuOpen.update((v) => !v);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

  logout() {
    this.auth.logout();
  }
}
