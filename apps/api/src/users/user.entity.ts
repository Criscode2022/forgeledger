import {
  Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { Client } from '../clients/client.entity';
import { Project } from '../projects/project.entity';
import { Invoice } from '../invoices/invoice.entity';
import { Expense } from '../expenses/expense.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ type: 'text' })
  passwordHash!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', default: 'My Studio' })
  businessName!: string;

  @Column({ type: 'text', default: 'USD' })
  currency!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Client, (c) => c.user)
  clients!: Client[];

  @OneToMany(() => Project, (p) => p.user)
  projects!: Project[];

  @OneToMany(() => Invoice, (i) => i.user)
  invoices!: Invoice[];

  @OneToMany(() => Expense, (e) => e.user)
  expenses!: Expense[];
}
