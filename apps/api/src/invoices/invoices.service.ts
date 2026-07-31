import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice, InvoiceStatus } from './invoice.entity';
import { InvoiceItem } from './invoice-item.entity';
import { CreateInvoiceDto, InvoiceItemDto, UpdateInvoiceDto } from './dto/invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private readonly invoices: Repository<Invoice>,
    @InjectRepository(InvoiceItem) private readonly items: Repository<InvoiceItem>,
  ) {}

  findAll(userId: string) {
    return this.invoices.find({
      where: { userId },
      relations: ['client', 'items'],
      order: { issueDate: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const invoice = await this.invoices.findOne({
      where: { id, userId },
      relations: ['client', 'items'],
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(userId: string, dto: CreateInvoiceDto) {
    const number = dto.number?.trim() || (await this.nextNumber(userId));
    const totals = this.computeTotals(dto.items, dto.taxRate ?? 0);
    const invoice = this.invoices.create({
      userId,
      clientId: dto.clientId,
      number,
      status: dto.status || 'draft',
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      taxRate: dto.taxRate ?? 0,
      notes: dto.notes?.trim() || null,
      paidAt: dto.status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
      ...totals,
      items: dto.items.map((item) =>
        this.items.create({
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: round2(item.quantity * item.unitPrice),
        }),
      ),
    });
    return this.invoices.save(invoice);
  }

  async update(userId: string, id: string, dto: UpdateInvoiceDto) {
    const invoice = await this.findOne(userId, id);

    if (dto.clientId !== undefined) invoice.clientId = dto.clientId;
    if (dto.number !== undefined) invoice.number = dto.number.trim();
    if (dto.issueDate !== undefined) invoice.issueDate = dto.issueDate;
    if (dto.dueDate !== undefined) invoice.dueDate = dto.dueDate;
    if (dto.taxRate !== undefined) invoice.taxRate = dto.taxRate;
    if (dto.notes !== undefined) invoice.notes = dto.notes?.trim() || null;

    if (dto.status !== undefined) {
      invoice.status = dto.status;
      if (dto.status === 'paid' && !invoice.paidAt) {
        invoice.paidAt = new Date().toISOString().slice(0, 10);
      }
      if (dto.status !== 'paid') invoice.paidAt = null;
    }

    if (dto.items) {
      await this.items.delete({ invoiceId: invoice.id });
      const totals = this.computeTotals(dto.items, invoice.taxRate);
      Object.assign(invoice, totals);
      invoice.items = dto.items.map((item) =>
        this.items.create({
          invoiceId: invoice.id,
          description: item.description.trim(),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          amount: round2(item.quantity * item.unitPrice),
        }),
      );
    } else if (dto.taxRate !== undefined) {
      const totals = this.computeTotals(
        invoice.items.map((i) => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
        invoice.taxRate,
      );
      Object.assign(invoice, totals);
    }

    return this.invoices.save(invoice);
  }

  async updateStatus(userId: string, id: string, status: InvoiceStatus) {
    return this.update(userId, id, { status });
  }

  async remove(userId: string, id: string) {
    const invoice = await this.findOne(userId, id);
    await this.invoices.remove(invoice);
    return { ok: true };
  }

  private async nextNumber(userId: string) {
    const count = await this.invoices.count({ where: { userId } });
    const year = new Date().getFullYear();
    return `INV-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  private computeTotals(items: InvoiceItemDto[], taxRate: number) {
    const subtotal = round2(
      items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0),
    );
    const taxAmount = round2(subtotal * (taxRate / 100));
    const total = round2(subtotal + taxAmount);
    return { subtotal, taxAmount, total };
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
