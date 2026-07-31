import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen bg-bg text-fg">
      <header class="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-sm bg-accent text-sm font-semibold text-accent-fg">F</div>
          <span class="font-semibold tracking-tight">ForgeLedger</span>
        </div>
        <div class="flex items-center gap-2">
          <a routerLink="/login" class="btn-ghost">Sign in</a>
          <a routerLink="/register" class="btn-primary">Get started</a>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <div class="max-w-2xl">
          <p class="mb-3 text-sm font-medium uppercase tracking-wide text-muted">Freelance & SMB finance</p>
          <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl" style="line-height:1.1">
            Know who owes you, what you spent, and what is next.
          </h1>
          <p class="mt-5 max-w-xl text-base text-muted sm:text-lg">
            ForgeLedger is a production-ready business finance OS: clients, projects, invoices, expenses,
            and cash-flow analytics — built with Angular, NestJS, Neon Postgres, and Tailwind.
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/register" class="btn-primary px-5 py-3">Start free workspace</a>
            <a routerLink="/login" class="btn-secondary px-5 py-3">Try the demo</a>
          </div>
          <p class="mt-4 text-xs text-subtle">Demo account: demo&#64;forgeledger.app / demo1234</p>
        </div>

        <div class="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (f of features; track f.title) {
            <div class="card">
              <h2 class="font-semibold">{{ f.title }}</h2>
              <p class="mt-2 text-sm text-muted">{{ f.body }}</p>
            </div>
          }
        </div>
      </main>
    </div>
  `,
})
export class LandingComponent {
  features = [
    {
      title: 'Client CRM',
      body: 'Keep contacts, companies, and notes in one place — scoped to your workspace.',
    },
    {
      title: 'Smart invoices',
      body: 'Line items, tax, status workflow, and print-ready documents.',
    },
    {
      title: 'Expense tracking',
      body: 'Categorize spend, flag billable costs, and see net margin instantly.',
    },
    {
      title: 'Cash-flow dashboard',
      body: 'Revenue vs expenses, overdue AR, and pipeline draft totals at a glance.',
    },
  ];
}
