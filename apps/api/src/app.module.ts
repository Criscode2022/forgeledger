import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ClientsModule } from './clients/clients.module';
import { ProjectsModule } from './projects/projects.module';
import { InvoicesModule } from './invoices/invoices.module';
import { ExpensesModule } from './expenses/expenses.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/user.entity';
import { Client } from './clients/client.entity';
import { Project } from './projects/project.entity';
import { Invoice } from './invoices/invoice.entity';
import { InvoiceItem } from './invoices/invoice-item.entity';
import { Expense } from './expenses/expense.entity';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const databaseUrl = config.get<string>('DATABASE_URL');
        if (databaseUrl) {
          return {
            type: 'postgres' as const,
            url: databaseUrl,
            ssl:
              databaseUrl.includes('sslmode=require') ||
              databaseUrl.includes('neon.tech')
                ? { rejectUnauthorized: false }
                : undefined,
            entities: [User, Client, Project, Invoice, InvoiceItem, Expense],
            synchronize: config.get('DB_SYNC') !== 'false',
            logging: config.get('DB_LOGGING') === 'true',
          };
        }
        return {
          type: 'better-sqlite3' as const,
          database:
            config.get<string>('SQLITE_PATH') ||
            join(process.cwd(), 'data', 'forgeledger.sqlite'),
          entities: [User, Client, Project, Invoice, InvoiceItem, Expense],
          synchronize: true,
          logging: config.get('DB_LOGGING') === 'true',
        };
      },
    }),
    AuthModule,
    ClientsModule,
    ProjectsModule,
    InvoicesModule,
    ExpensesModule,
    DashboardModule,
    SeedModule,
  ],
})
export class AppModule {}
