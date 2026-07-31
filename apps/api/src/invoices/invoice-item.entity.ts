import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  invoiceId!: string;

  @ManyToOne(() => Invoice, (i) => i.items, { onDelete: 'CASCADE' })
  invoice!: Invoice;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'real', default: 1 })
  quantity!: number;

  @Column({ type: 'real', default: 0 })
  unitPrice!: number;

  @Column({ type: 'real', default: 0 })
  amount!: number;
}
