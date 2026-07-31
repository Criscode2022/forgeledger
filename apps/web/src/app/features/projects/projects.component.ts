import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Client, Project, ProjectStatus } from '../../core/models';
import { money, statusClass, statusLabel } from '../../core/utils';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  readonly projects = signal<Project[]>([]);
  readonly clients = signal<Client[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly editing = signal<Project | null>(null);
  readonly error = signal('');

  money = money;
  statusClass = statusClass;
  statusLabel = statusLabel;
  statuses: ProjectStatus[] = ['planned', 'active', 'on_hold', 'completed', 'cancelled'];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    clientId: [''],
    status: ['planned' as ProjectStatus, Validators.required],
    budget: [0, Validators.min(0)],
    hourlyRate: [0, Validators.min(0)],
    startDate: [''],
    dueDate: [''],
  });

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.loading.set(true);
    this.api.getProjects().subscribe({
      next: (rows) => {
        this.projects.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load projects');
        this.loading.set(false);
      },
    });
    this.api.getClients().subscribe({ next: (c) => this.clients.set(c) });
  }

  openCreate() {
    this.editing.set(null);
    this.form.reset({
      name: '',
      description: '',
      clientId: '',
      status: 'planned',
      budget: 0,
      hourlyRate: 0,
      startDate: '',
      dueDate: '',
    });
    this.showForm.set(true);
  }

  openEdit(p: Project) {
    this.editing.set(p);
    this.form.reset({
      name: p.name,
      description: p.description || '',
      clientId: p.clientId || '',
      status: p.status,
      budget: p.budget,
      hourlyRate: p.hourlyRate,
      startDate: p.startDate || '',
      dueDate: p.dueDate || '',
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
      name: v.name,
      description: v.description || undefined,
      clientId: v.clientId || undefined,
      status: v.status,
      budget: Number(v.budget) || 0,
      hourlyRate: Number(v.hourlyRate) || 0,
      startDate: v.startDate || undefined,
      dueDate: v.dueDate || undefined,
    };
    const edit = this.editing();
    const req = edit
      ? this.api.updateProject(edit.id, payload)
      : this.api.createProject(payload);
    req.subscribe({
      next: () => {
        this.closeForm();
        this.reload();
      },
      error: (err) => this.error.set(err?.error?.message || 'Save failed'),
    });
  }

  remove(p: Project) {
    if (!confirm(`Delete project ${p.name}?`)) return;
    this.api.deleteProject(p.id).subscribe({
      next: () => this.reload(),
      error: () => this.error.set('Delete failed'),
    });
  }
}
