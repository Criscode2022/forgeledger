import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/client.entity';
import { Expense } from '../expenses/expense.entity';
import { Invoice } from '../invoices/invoice.entity';
import { InvoiceItem } from '../invoices/invoice-item.entity';
import { Project } from '../projects/project.entity';
import { User } from '../users/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Client, Project, Invoice, InvoiceItem, Expense]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
