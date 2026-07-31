import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export type ExpenseCategory =
  | 'software' | 'hardware' | 'marketing' | 'travel' | 'office' | 'contractor' | 'other';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.expenses, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text', default: 'other' })
  category!: ExpenseCategory;

  @Column({ type: 'real' })
  amount!: number;

  @Column({ type: 'text' })
  date!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'boolean', default: false })
  billable!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
