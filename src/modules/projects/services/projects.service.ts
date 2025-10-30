import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { ProjectRepository } from '../repositories/project.repository';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { Project, ProjectDocument } from '../entities/project.entity';
import { QueryProjectDto } from '../dto/query-project.dto';
import { CurrentUser as CurrentUserType } from '../../auth/decorators/current-user.decorator';
import { Inject, Optional } from '@nestjs/common';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';
import { UserRole } from '../../users/entities/user.entity';
import { ModifyMembersDto } from '../dto/modify-members.dto';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectRepository: ProjectRepository,
    @Optional()
    @Inject('IUserLookupService')
    private readonly userLookupService?: IUserLookupService,
  ) {}

  create(
    dto: CreateProjectDto,
    currentUser: CurrentUserType,
  ): Promise<ProjectDocument> {
    const creatorId = new Types.ObjectId(currentUser._id);
    const memberIds = (dto.members ?? []).map((m) => new Types.ObjectId(m));
    const uniqueMembers = [creatorId, ...memberIds]
      .map((id) => id.toString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((id) => new Types.ObjectId(id));

    const managerId = dto.projectManager
      ? new Types.ObjectId(dto.projectManager)
      : creatorId;

    const payload: Partial<Project> = {
      name: dto.name,
      description: dto.description ?? '',
      createdBy: creatorId,
      team: dto.team ? new Types.ObjectId(dto.team) : undefined,
      members: uniqueMembers,
      tasks: (dto.tasks ?? []).map((t) => new Types.ObjectId(t)),
      isActive: dto.isActive ?? true,
      projectManager: managerId,
    } as const;
    return this.projectRepository.create(payload);
  }

  findAll(): Promise<ProjectDocument[]> {
    const filter: FilterQuery<ProjectDocument> = { deletedAt: null };
    return this.projectRepository.findAll(filter, { sort: { createdAt: -1 } });
  }

  findAllWithPagination(query: QueryProjectDto) {
    const filter: any = { deletedAt: null };
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };
    if (query.createdBy) filter.createdBy = new Types.ObjectId(query.createdBy);
    if (query.projectManager)
      filter.projectManager = new Types.ObjectId(query.projectManager);
    if (query.memberId) filter.members = new Types.ObjectId(query.memberId);
    if (query.teamId) filter.team = new Types.ObjectId(query.teamId);
    if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;

    return this.projectRepository.findWithPagination({
      filter,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: { createdAt: -1 },
    });
  }

  async findOne(id: string): Promise<ProjectDocument> {
    const filter: FilterQuery<ProjectDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const project = await this.projectRepository.findOne(filter);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async update(id: string, dto: UpdateProjectDto): Promise<ProjectDocument> {
    const updatePayload: UpdateQuery<ProjectDocument> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.isActive !== undefined) updatePayload.isActive = dto.isActive;
    if (dto.team !== undefined)
      updatePayload.team = new Types.ObjectId(dto.team);
    if (dto.projectManager !== undefined)
      updatePayload.projectManager = dto.projectManager
        ? new Types.ObjectId(dto.projectManager)
        : undefined;
    if (dto.members !== undefined)
      updatePayload.members = dto.members.map((m) => new Types.ObjectId(m));
    if (dto.tasks !== undefined)
      updatePayload.tasks = dto.tasks.map((t) => new Types.ObjectId(t));

    const filter: FilterQuery<ProjectDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const updated = await this.projectRepository.findOneAndUpdate(
      filter,
      updatePayload,
    );
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async softDelete(id: string): Promise<{ success: boolean }> {
    const filter: FilterQuery<ProjectDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const update: UpdateQuery<ProjectDocument> = {
      deletedAt: new Date() as any,
      isActive: false,
    };
    const updated = await this.projectRepository.findOneAndUpdate(
      filter,
      update,
    );
    if (!updated) throw new NotFoundException('Project not found');
    return { success: true };
  }

  async addMembers(
    id: string,
    dto: ModifyMembersDto,
  ): Promise<ProjectDocument> {
    let memberIds = dto.members.map((m) => new Types.ObjectId(m));
    if (this.userLookupService) {
      const users = await Promise.all(
        dto.members.map((m) => this.userLookupService.findUserById(m)),
      );
      const allowed = users
        .map((u, idx) => ({ u, idStr: dto.members[idx] }))
        .filter((x) => x.u && x.u.role !== UserRole.SUPER_ADMIN)
        .map((x) => x.idStr);
      memberIds = allowed.map((m) => new Types.ObjectId(m));
    }
    const update: UpdateQuery<ProjectDocument> = {
      $addToSet: { members: { $each: memberIds } } as any,
    } as any;
    const filter: FilterQuery<ProjectDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const updated = await this.projectRepository.findOneAndUpdate(
      filter,
      update,
    );
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }

  async removeMembers(
    id: string,
    dto: ModifyMembersDto,
  ): Promise<ProjectDocument> {
    let memberIds = dto.members.map((m) => new Types.ObjectId(m));
    if (this.userLookupService) {
      const users = await Promise.all(
        dto.members.map((m) => this.userLookupService.findUserById(m)),
      );
      const allowed = users
        .map((u, idx) => ({ u, idStr: dto.members[idx] }))
        .filter((x) => x.u && x.u.role !== UserRole.SUPER_ADMIN)
        .map((x) => x.idStr);
      memberIds = allowed.map((m) => new Types.ObjectId(m));
    }
    const update: UpdateQuery<ProjectDocument> = {
      $pullAll: { members: memberIds } as any,
    } as any;
    const filter: FilterQuery<ProjectDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const updated = await this.projectRepository.findOneAndUpdate(
      filter,
      update,
    );
    if (!updated) throw new NotFoundException('Project not found');
    return updated;
  }
}
