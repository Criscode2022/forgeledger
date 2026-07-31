import {
  Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Project } from '../projects/project.entity';
import { Invoice } from '../invoices/invoice.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  userId!: string;

  @ManyToOne(() => User, (u) => u.clients, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  email!: string | null;

  @Column({ type: 'text', nullable: true })
  company!: string | null;

  @Column({ type: 'text', nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'text', default: 'active' })
  status!: 'active' | 'archived';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Project, (p) => p.client)
  projects!: Project[];

  @OneToMany(() => Invoice, (i) => i.client)
  invoices!: Invoice[];
}
