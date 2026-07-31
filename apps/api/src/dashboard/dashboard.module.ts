import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../clients/client.entity';
import { Expense } from '../expenses/expense.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Project } from '../projects/project.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, Expense, Client, Project])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
