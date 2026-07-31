import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Client } from '../../core/models';
import { statusClass, statusLabel } from '../../core/utils';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editing = signal<Client | null>(null);
  readonly error = signal('');
  readonly query = signal('');

  statusClass = statusClass;
  statusLabel = statusLabel;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: [''],
    company: [''],
    phone: [''],
    notes: [''],
  });

  ngOnInit() {
    this.reload();
  }

  filtered() {
    const q = this.query().toLowerCase().trim();
    if (!q) return this.clients();
    return this.clients().filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company || '').toLowerCase().includes(q) ||
        (c.email || '').toLowerCase().includes(q),
    );
  }

  reload() {
    this.loading.set(true);
    this.api.getClients().subscribe({
      next: (rows) => {
        this.clients.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load clients');
        this.loading.set(false);
      },
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({ name: '', email: '', company: '', phone: '', notes: '' });
    this.showForm.set(true);
  }

  openEdit(client: Client) {
    this.editing.set(client);
    this.form.reset({
      name: client.name,
      email: client.email || '',
      company: client.company || '',
      phone: client.phone || '',
      notes: client.notes || '',
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editing.set(null);
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      email: value.email || undefined,
      company: value.company || undefined,
      phone: value.phone || undefined,
      notes: value.notes || undefined,
    };
    const edit = this.editing();
    const req = edit
      ? this.api.updateClient(edit.id, payload)
      : this.api.createClient(payload);
    req.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: (err) => this.error.set(err?.error?.message || 'Save failed'),
    });
  }

  remove(client: Client) {
    if (!confirm(`Delete ${client.name}?`)) return;
    this.api.deleteClient(client.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
