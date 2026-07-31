import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  AuthResponse,
  Client,
  DashboardSummary,
  Expense,
  Invoice,
  Project,
  User,
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api';

  // Auth
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password });
  }

  register(payload: { email: string; password: string; name: string; businessName?: string }) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }

  me() {
    return this.http.get<User>(`${this.base}/auth/me`);
  }

  // Dashboard
  dashboard() {
    return this.http.get<DashboardSummary>(`${this.base}/dashboard`);
  }

  // Clients
  getClients() {
    return this.http.get<Client[]>(`${this.base}/clients`);
  }

  createClient(body: Partial<Client>) {
    return this.http.post<Client>(`${this.base}/clients`, body);
  }

  updateClient(id: string, body: Partial<Client>) {
    return this.http.patch<Client>(`${this.base}/clients/${id}`, body);
  }

  deleteClient(id: string) {
    return this.http.delete(`${this.base}/clients/${id}`);
  }

  // Projects
  getProjects() {
    return this.http.get<Project[]>(`${this.base}/projects`);
  }

  createProject(body: Partial<Project>) {
    return this.http.post<Project>(`${this.base}/projects`, body);
  }

  updateProject(id: string, body: Partial<Project>) {
    return this.http.patch<Project>(`${this.base}/projects/${id}`, body);
  }

  deleteProject(id: string) {
    return this.http.delete(`${this.base}/projects/${id}`);
  }

  // Invoices
  getInvoices() {
    return this.http.get<Invoice[]>(`${this.base}/invoices`);
  }

  getInvoice(id: string) {
    return this.http.get<Invoice>(`${this.base}/invoices/${id}`);
  }

  createInvoice(body: unknown) {
    return this.http.post<Invoice>(`${this.base}/invoices`, body);
  }

  updateInvoice(id: string, body: unknown) {
    return this.http.patch<Invoice>(`${this.base}/invoices/${id}`, body);
  }

  updateInvoiceStatus(id: string, status: string) {
    return this.http.patch<Invoice>(`${this.base}/invoices/${id}/status`, { status });
  }

  deleteInvoice(id: string) {
    return this.http.delete(`${this.base}/invoices/${id}`);
  }

  // Expenses
  getExpenses() {
    return this.http.get<Expense[]>(`${this.base}/expenses`);
  }

  createExpense(body: Partial<Expense>) {
    return this.http.post<Expense>(`${this.base}/expenses`, body);
  }

  updateExpense(id: string, body: Partial<Expense>) {
    return this.http.patch<Expense>(`${this.base}/expenses/${id}`, body);
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.base}/expenses/${id}`);
  }
}
