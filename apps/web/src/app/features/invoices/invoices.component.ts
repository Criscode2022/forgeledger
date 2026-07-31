import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { Client, Invoice, InvoiceStatus } from '../../core/models';
import { money, statusClass, statusLabel } from '../../core/utils';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './invoices.component.html',
})
export class InvoicesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly invoices = signal<Invoice[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly error = signal('');
  readonly filter = signal<string>('all');

  money = money;
  statusClass = statusClass;
  statusLabel = statusLabel;
  statuses: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'void'];

  readonly form = this.fb.nonNullable.group({
    clientId: ['', Validators.required],
    status: ['draft' as InvoiceStatus],
    issueDate: [new Date().toISOString().slice(0, 10), Validators.required],
    dueDate: [new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10), Validators.required],
    taxRate: [8.5, [Validators.min(0)]],
    notes: [''],
    items: this.fb.array([this.itemGroup()]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.reload();
  }

  filtered() {
    const f = this.filter();
    if (f === 'all') return this.invoices();
    return this.invoices().filter((i) => i.status === f);
  }

  private itemGroup(description = '', quantity = 1, unitPrice = 0) {
    return this.fb.nonNullable.group({
      description: [description, Validators.required],
      quantity: [quantity, [Validators.required, Validators.min(0.01)]],
      unitPrice: [unitPrice, [Validators.required, Validators.min(0)]],
    });
  }

  reload() {
    this.loading.set(true);
    this.api.getInvoices().subscribe({
      next: (rows) => {
        this.invoices.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load invoices');
        this.loading.set(false);
      },
    });
    this.api.getClients().subscribe({ next: (c) => this.clients.set(c) });
  }

  openCreate() {
    this.form.reset({
      clientId: this.clients()[0]?.id || '',
      status: 'draft',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      taxRate: 8.5,
      notes: '',
    });
    this.items.clear();
    this.items.push(this.itemGroup('Professional services', 1, 150));
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
  }

  addItem() {
    this.items.push(this.itemGroup());
  }

  removeItem(i: number) {
    if (this.items.length > 1) this.items.removeAt(i);
  }

  previewTotal() {
    const items = this.items.getRawValue();
    const sub = items.reduce((s, it) => s + Number(it.quantity) * Number(it.unitPrice), 0);
    const tax = sub * (Number(this.form.value.taxRate) || 0) / 100;
    return sub + tax;
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      clientId: v.clientId,
      status: v.status,
      issueDate: v.issueDate,
      dueDate: v.dueDate,
      taxRate: Number(v.taxRate) || 0,
      notes: v.notes || undefined,
      items: v.items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
      })),
    };
    this.api.createInvoice(payload).subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: (err) => this.error.set(err?.error?.message || 'Create failed'),
    });
  }

  setStatus(inv: Invoice, status: InvoiceStatus) {
    this.api.updateInvoiceStatus(inv.id, status).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Status update failed'),
    });
  }

  remove(inv: Invoice) {
    if (!confirm(`Delete ${inv.number}?`)) return;
    this.api.deleteInvoice(inv.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
