import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(Expense) private readonly repo: Repository<Expense>) {}

  findAll(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { date: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const expense = await this.repo.findOne({ where: { id, userId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
  }

  create(userId: string, dto: CreateExpenseDto) {
    const expense = this.repo.create({
      userId,
      title: dto.title.trim(),
      category: dto.category || 'other',
      amount: dto.amount,
      date: dto.date,
      notes: dto.notes?.trim() || null,
      billable: dto.billable ?? false,
    });
    return this.repo.save(expense);
  }

  async update(userId: string, id: string, dto: UpdateExpenseDto) {
    const expense = await this.findOne(userId, id);
    if (dto.title !== undefined) expense.title = dto.title.trim();
    if (dto.category !== undefined) expense.category = dto.category;
    if (dto.amount !== undefined) expense.amount = dto.amount;
    if (dto.date !== undefined) expense.date = dto.date;
    if (dto.notes !== undefined) expense.notes = dto.notes?.trim() || null;
    if (dto.billable !== undefined) expense.billable = dto.billable;
    return this.repo.save(expense);
  }

  async remove(userId: string, id: string) {
    const expense = await this.findOne(userId, id);
    await this.repo.remove(expense);
    return { ok: true };
  }
}
