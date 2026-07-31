import {
  Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Client } from '../clients/client.entity';

export type ProjectStatus = 'planned' | 'active' | 'on_hold' | 'completed' | 'cancelled';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.projects, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text', nullable: true })
  clientId!: string | null;

  @ManyToOne(() => Client, (c) => c.projects, { onDelete: 'SET NULL', nullable: true })
  client!: Client | null;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', default: 'planned' })
  status!: ProjectStatus;

  @Column({ type: 'real', default: 0 })
  budget!: number;

  @Column({ type: 'real', default: 0 })
  hourlyRate!: number;

  @Column({ type: 'text', nullable: true })
  startDate!: string | null;

  @Column({ type: 'text', nullable: true })
  dueDate!: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
