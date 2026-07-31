import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Invoice, InvoiceStatus } from '../../core/models';
import { money, statusClass, statusLabel } from '../../core/utils';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './invoice-detail.component.html',
})
export class InvoiceDetailComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);

  readonly invoice = signal<Invoice | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');

  money = money;
  statusClass = statusClass;
  statusLabel = statusLabel;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.getInvoice(id).subscribe({
      next: (inv) => {
        this.invoice.set(inv);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Invoice not found');
        this.loading.set(false);
      },
    });
  }

  setStatus(status: InvoiceStatus) {
    const inv = this.invoice();
    if (!inv) return;
    this.api.updateInvoiceStatus(inv.id, status).subscribe({
      next: (updated) => this.invoice.set(updated),
      error: () => this.error.set('Could not update status'),
    });
  }

  print() {
    window.print();
  }
}
