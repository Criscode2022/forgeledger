import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

@Injectable()
export class ProjectsService {
  constructor(@InjectRepository(Project) private readonly repo: Repository<Project>) {}

  findAll(userId: string) {
    return this.repo.find({
      where: { userId },
      relations: ['client'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(userId: string, id: string) {
    const project = await this.repo.findOne({
      where: { id, userId },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  create(userId: string, dto: CreateProjectDto) {
    const project = this.repo.create({
      userId,
      name: dto.name.trim(),
      description: dto.description?.trim() || null,
      clientId: dto.clientId || null,
      status: dto.status || 'planned',
      budget: dto.budget ?? 0,
      hourlyRate: dto.hourlyRate ?? 0,
      startDate: dto.startDate || null,
      dueDate: dto.dueDate || null,
    });
    return this.repo.save(project);
  }

  async update(userId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(userId, id);
    if (dto.name !== undefined) project.name = dto.name.trim();
    if (dto.description !== undefined) project.description = dto.description?.trim() || null;
    if (dto.clientId !== undefined) project.clientId = dto.clientId;
    if (dto.status !== undefined) project.status = dto.status;
    if (dto.budget !== undefined) project.budget = dto.budget;
    if (dto.hourlyRate !== undefined) project.hourlyRate = dto.hourlyRate;
    if (dto.startDate !== undefined) project.startDate = dto.startDate;
    if (dto.dueDate !== undefined) project.dueDate = dto.dueDate;
    return this.repo.save(project);
  }

  async remove(userId: string, id: string) {
    const project = await this.findOne(userId, id);
    await this.repo.remove(project);
    return { ok: true };
  }
}
