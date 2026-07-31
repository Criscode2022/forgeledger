import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Expense } from '../expenses/expense.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Project } from '../projects/project.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
  ) {}

  async summary(userId: string) {
    const [invoices, expenses, clients, projects] = await Promise.all([
      this.invoices.find({ where: { userId }, relations: ['client'] }),
      this.expenses.find({ where: { userId } }),
      this.clients.count({ where: { userId, status: 'active' } }),
      this.projects.find({ where: { userId } }),
    ]);

    const today = new Date().toISOString().slice(0, 10);
    let paidRevenue = 0;
    let outstanding = 0;
    let overdue = 0;
    let draftTotal = 0;

    for (const inv of invoices) {
      if (inv.status === 'paid') paidRevenue += inv.total;
      else if (inv.status === 'void') continue;
      else if (inv.status === 'draft') draftTotal += inv.total;
      else if (inv.dueDate < today || inv.status === 'overdue') overdue += inv.total;
      else outstanding += inv.total;
    }

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const net = paidRevenue - totalExpenses;
    const activeProjects = projects.filter((p) => p.status === 'active').length;

    const monthKey = (d: string) => d.slice(0, 7);
    const months: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const revenueByMonth = months.map((m) => ({
      month: m,
      revenue: round2(
        invoices
          .filter((i) => i.status === 'paid' && monthKey(i.paidAt || i.issueDate) === m)
          .reduce((s, i) => s + i.total, 0),
      ),
      expenses: round2(
        expenses.filter((e) => monthKey(e.date) === m).reduce((s, e) => s + e.amount, 0),
      ),
    }));

    const expensesByCategory = Object.entries(
      expenses.reduce<Record<string, number>>((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {}),
    )
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount);

    const recentInvoices = [...invoices]
      .sort((a, b) => b.issueDate.localeCompare(a.issueDate))
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        number: i.number,
        status: i.status,
        total: i.total,
        dueDate: i.dueDate,
        clientName: i.client?.name || '—',
      }));

    const invoiceStatusBreakdown = (['draft', 'sent', 'paid', 'overdue', 'void'] as const).map(
      (status) => ({
        status,
        count: invoices.filter((i) => i.status === status).length,
        total: round2(
          invoices.filter((i) => i.status === status).reduce((s, i) => s + i.total, 0),
        ),
      }),
    );

    return {
      kpis: {
        paidRevenue: round2(paidRevenue),
        outstanding: round2(outstanding),
        overdue: round2(overdue),
        totalExpenses: round2(totalExpenses),
        net: round2(net),
        draftTotal: round2(draftTotal),
        activeClients: clients,
        activeProjects,
        invoiceCount: invoices.length,
      },
      revenueByMonth,
      expensesByCategory,
      recentInvoices,
      invoiceStatusBreakdown,
    };
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
