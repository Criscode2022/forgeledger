import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from './client.entity';
import { CreateClientDto, UpdateClientDto } from './dto/client.dto';

@Injectable()
export class ClientsService {
  constructor(@InjectRepository(Client) private readonly repo: Repository<Client>) {}

  findAll(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { name: 'ASC' },
    });
  }

  async findOne(userId: string, id: string) {
    const client = await this.repo.findOne({ where: { id, userId } });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }

  create(userId: string, dto: CreateClientDto) {
    const client = this.repo.create({
      userId,
      name: dto.name.trim(),
      email: dto.email?.trim() || null,
      company: dto.company?.trim() || null,
      phone: dto.phone?.trim() || null,
      notes: dto.notes?.trim() || null,
      status: 'active',
    });
    return this.repo.save(client);
  }

  async update(userId: string, id: string, dto: UpdateClientDto) {
    const client = await this.findOne(userId, id);
    if (dto.name !== undefined) client.name = dto.name.trim();
    if (dto.email !== undefined) client.email = dto.email?.trim() || null;
    if (dto.company !== undefined) client.company = dto.company?.trim() || null;
    if (dto.phone !== undefined) client.phone = dto.phone?.trim() || null;
    if (dto.notes !== undefined) client.notes = dto.notes?.trim() || null;
    if (dto.status !== undefined) client.status = dto.status;
    return this.repo.save(client);
  }

  async remove(userId: string, id: string) {
    const client = await this.findOne(userId, id);
    await this.repo.remove(client);
    return { ok: true };
  }
}
