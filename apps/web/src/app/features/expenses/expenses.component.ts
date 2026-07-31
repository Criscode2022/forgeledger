import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Expense, ExpenseCategory } from '../../core/models';
import { money } from '../../core/utils';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expenses.component.html',
})
export class ExpensesComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly expenses = signal<Expense[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editing = signal<Expense | null>(null);
  readonly error = signal('');

  money = money;
  categories: ExpenseCategory[] = [
    'software',
    'hardware',
    'marketing',
    'travel',
    'office',
    'contractor',
    'other',
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    category: ['other' as ExpenseCategory, Validators.required],
    amount: [0, [Validators.required, Validators.min(0.01)]],
    date: [new Date().toISOString().slice(0, 10), Validators.required],
    notes: [''],
    billable: [false],
  });

  ngOnInit() {
    this.reload();
  }

  total() {
    return this.expenses().reduce((s, e) => s + e.amount, 0);
  }

  reload() {
    this.loading.set(true);
    this.api.getExpenses().subscribe({
      next: (rows) => {
        this.expenses.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load expenses');
        this.loading.set(false);
      },
    });
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({
      title: '',
      category: 'other',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      notes: '',
      billable: false,
    });
    this.showForm.set(true);
  }

  openEdit(e: Expense) {
    this.editing.set(e);
    this.form.reset({
      title: e.title,
      category: e.category,
      amount: e.amount,
      date: e.date,
      notes: e.notes || '',
      billable: e.billable,
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
    const v = this.form.getRawValue();
    const payload = {
      title: v.title,
      category: v.category,
      amount: Number(v.amount),
      date: v.date,
      notes: v.notes || undefined,
      billable: v.billable,
    };
    const edit = this.editing();
    const req = edit
      ? this.api.updateExpense(edit.id, payload)
      : this.api.createExpense(payload);
    req.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: (err) => this.error.set(err?.error?.message || 'Save failed'),
    });
  }

  remove(e: Expense) {
    if (!confirm(`Delete expense ${e.title}?`)) return;
    this.api.deleteExpense(e.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
