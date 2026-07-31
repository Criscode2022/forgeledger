export interface User {
  id: string;
  email: string;
  name: string;
  businessName: string;
  currency: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientId: string | null;
  client?: Client | null;
  status: ProjectStatus;
  budget: number;
  hourlyRate: number;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client?: Client;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string | null;
  paidAt: string | null;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'software'
  | 'hardware'
  | 'marketing'
  | 'travel'
  | 'office'
  | 'contractor'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes: string | null;
  billable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  kpis: {
    paidRevenue: number;
    outstanding: number;
    overdue: number;
    totalExpenses: number;
    net: number;
    draftTotal: number;
    activeClients: number;
    activeProjects: number;
    invoiceCount: number;
  };
  revenueByMonth: { month: string; revenue: number; expenses: number }[];
  expensesByCategory: { category: string; amount: number }[];
  recentInvoices: {
    id: string;
    number: string;
    status: InvoiceStatus;
    total: number;
    dueDate: string;
    clientName: string;
  }[];
  invoiceStatusBreakdown: { status: InvoiceStatus; count: number; total: number }[];
}
