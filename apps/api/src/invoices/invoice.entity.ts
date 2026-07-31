import {
  Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { InvoiceItem } from './invoice-item.entity';

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.invoices, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  clientId!: string;

  @ManyToOne(() => Client, (c) => c.invoices, { onDelete: 'CASCADE' })
  client!: Client;

  @Column({ type: 'text' })
  number!: string;

  @Column({ type: 'text', default: 'draft' })
  status!: InvoiceStatus;

  @Column({ type: 'text' })
  issueDate!: string;

  @Column({ type: 'text' })
  dueDate!: string;

  @Column({ type: 'real', default: 0 })
  taxRate!: number;

  @Column({ type: 'real', default: 0 })
  subtotal!: number;

  @Column({ type: 'real', default: 0 })
  taxAmount!: number;

  @Column({ type: 'real', default: 0 })
  total!: number;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', nullable: true })
  paidAt!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true, eager: true })
  items!: InvoiceItem[];
}
