import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Client } from '../clients/client.entity';
import { Expense } from '../expenses/expense.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Client) private readonly clients: Repository<Client>,
    @InjectRepository(Project) private readonly projects: Repository<Project>,
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly items: Repository<InvoiceItem>,
    @InjectRepository(Expense) private readonly expenses: Repository<Expense>,
  ) {}

  async onModuleInit() {
    if (process.env.SKIP_SEED === 'true') return;
    const count = await this.users.count();
    if (count > 0) {
      this.log.log('Database already seeded — skipping');
      return;
    }
    await this.seed();
  }

  async seed() {
    this.log.log('Seeding demo data…');
    const passwordHash = await bcrypt.hash('demo1234', 12);
    const user = await this.users.save(
      this.users.create({
        email: 'demo@forgeledger.app',
        passwordHash,
        name: 'Alex Rivera',
        businessName: 'Rivera Studio',
        currency: 'USD',
      }),
    );

    const clientData = [
      { name: 'Northwind Labs', email: 'ap@northwind.io', company: 'Northwind Labs Inc.', phone: '+1 415 555 0142' },
      { name: 'Harbor Retail', email: 'finance@harbor.co', company: 'Harbor Retail Group', phone: '+1 212 555 0198' },
      { name: 'Lumen Health', email: 'ops@lumen.health', company: 'Lumen Health', phone: '+1 617 555 0110' },
      { name: 'Cascade Media', email: 'hello@cascade.media', company: 'Cascade Media LLC', phone: '+1 310 555 0177' },
    ];

    const clients = await this.clients.save(
      clientData.map((c) =>
        this.clients.create({
          userId: user.id,
          ...c,
          status: 'active',
          notes: 'Seeded demo client',
        }),
      ),
    );

    const projects = await this.projects.save([
      this.projects.create({
        userId: user.id,
        clientId: clients[0].id,
        name: 'Product design system',
        description: 'Component library + design tokens for web and mobile.',
        status: 'active',
        budget: 28000,
        hourlyRate: 140,
        startDate: monthsAgo(4),
        dueDate: monthsFromNow(2),
      }),
      this.projects.create({
        userId: user.id,
        clientId: clients[1].id,
        name: 'E-commerce rebuild',
        description: 'Headless storefront and checkout redesign.',
        status: 'active',
        budget: 45000,
        hourlyRate: 150,
        startDate: monthsAgo(2),
        dueDate: monthsFromNow(3),
      }),
      this.projects.create({
        userId: user.id,
        clientId: clients[2].id,
        name: 'Patient portal MVP',
        description: 'Secure messaging and appointment scheduling.',
        status: 'completed',
        budget: 32000,
        hourlyRate: 145,
        startDate: monthsAgo(8),
        dueDate: monthsAgo(1),
      }),
      this.projects.create({
        userId: user.id,
        clientId: clients[3].id,
        name: 'Brand site refresh',
        description: 'Marketing site redesign and CMS migration.',
        status: 'planned',
        budget: 12000,
        hourlyRate: 125,
        startDate: monthsFromNow(1),
        dueDate: monthsFromNow(3),
      }),
    ]);

    const inv1 = await this.createInvoice(user.id, clients[0].id, {
      number: 'INV-2026-0001',
      status: 'paid',
      issueDate: monthsAgo(3),
      dueDate: monthsAgo(2),
      paidAt: monthsAgo(2),
      taxRate: 8.5,
      items: [
        { description: 'Design system discovery', quantity: 40, unitPrice: 140 },
        { description: 'Token architecture', quantity: 24, unitPrice: 140 },
      ],
    });

    const inv2 = await this.createInvoice(user.id, clients[0].id, {
      number: 'INV-2026-0002',
      status: 'sent',
      issueDate: monthsAgo(0),
      dueDate: monthsFromNow(1),
      taxRate: 8.5,
      items: [
        { description: 'Component library sprint', quantity: 60, unitPrice: 140 },
        { description: 'Documentation package', quantity: 1, unitPrice: 1800 },
      ],
    });

    const inv3 = await this.createInvoice(user.id, clients[1].id, {
      number: 'INV-2026-0003',
      status: 'overdue',
      issueDate: monthsAgo(2),
      dueDate: monthsAgo(1),
      taxRate: 8.875,
      items: [
        { description: 'Checkout UX redesign', quantity: 48, unitPrice: 150 },
        { description: 'A/B test setup', quantity: 12, unitPrice: 150 },
      ],
    });

    const inv4 = await this.createInvoice(user.id, clients[2].id, {
      number: 'INV-2026-0004',
      status: 'paid',
      issueDate: monthsAgo(5),
      dueDate: monthsAgo(4),
      paidAt: monthsAgo(4),
      taxRate: 6.25,
      items: [
        { description: 'Portal MVP build', quantity: 120, unitPrice: 145 },
        { description: 'Security review support', quantity: 16, unitPrice: 160 },
      ],
    });

    const inv5 = await this.createInvoice(user.id, clients[3].id, {
      number: 'INV-2026-0005',
      status: 'draft',
      issueDate: today(),
      dueDate: monthsFromNow(1),
      taxRate: 9.5,
      items: [
        { description: 'Discovery workshop', quantity: 8, unitPrice: 125 },
        { description: 'Information architecture', quantity: 20, unitPrice: 125 },
      ],
    });

    await this.expenses.save([
      this.expenses.create({
        userId: user.id,
        title: 'Figma Organization seat',
        category: 'software',
        amount: 75,
        date: monthsAgo(0),
        billable: false,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'Cloud hosting — production',
        category: 'software',
        amount: 186.4,
        date: monthsAgo(0),
        billable: true,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'Client workshop travel',
        category: 'travel',
        amount: 420,
        date: monthsAgo(1),
        billable: true,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'MacBook Pro repair',
        category: 'hardware',
        amount: 349,
        date: monthsAgo(2),
        billable: false,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'Contractor — motion design',
        category: 'contractor',
        amount: 2400,
        date: monthsAgo(1),
        billable: true,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'LinkedIn ads test',
        category: 'marketing',
        amount: 350,
        date: monthsAgo(3),
        billable: false,
      }),
      this.expenses.create({
        userId: user.id,
        title: 'Co-working desk',
        category: 'office',
        amount: 280,
        date: monthsAgo(0),
        billable: false,
      }),
    ]);

    void inv1;
    void inv2;
    void inv3;
    void inv4;
    void inv5;
    void projects;

    this.log.log('Seed complete — demo@forgeledger.app / demo1234');
  }

  private async createInvoice(
    userId: string,
    clientId: string,
    data: {
      number: string;
      status: Invoice['status'];
      issueDate: string;
      dueDate: string;
      paidAt?: string;
      taxRate: number;
      items: { description: string; quantity: number; unitPrice: number }[];
    },
  ) {
    const subtotal = round2(
      data.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
    );
    const taxAmount = round2(subtotal * (data.taxRate / 100));
    const total = round2(subtotal + taxAmount);

    const invoice = await this.invoices.save(
      this.invoices.create({
        userId,
        clientId,
        number: data.number,
        status: data.status,
        issueDate: data.issueDate,
        dueDate: data.dueDate,
        paidAt: data.paidAt || null,
        taxRate: data.taxRate,
        subtotal,
        taxAmount,
        total,
        notes: null,
        items: data.items.map((i) =>
          this.items.create({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            amount: round2(i.quantity * i.unitPrice),
          }),
        ),
      }),
    );
    return invoice;
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthsAgo(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d.toISOString().slice(0, 10);
}

function monthsFromNow(n: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
