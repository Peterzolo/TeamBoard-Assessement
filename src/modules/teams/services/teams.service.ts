import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { TeamRepository } from '../repositories/team.repository';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import { Team, TeamDocument } from '../entities/team.entity';
import { QueryTeamDto } from '../dto/query-team.dto';
import { CurrentUser as CurrentUserType } from '../../auth/decorators/current-user.decorator';

@Injectable()
export class TeamsService {
  constructor(private readonly teamRepository: TeamRepository) {}

  create(
    dto: CreateTeamDto,
    currentUser: CurrentUserType,
  ): Promise<TeamDocument> {
    const creatorId = new Types.ObjectId(currentUser._id);
    const memberIds = (dto.members ?? []).map((m) => new Types.ObjectId(m));
    const uniqueMembers = [creatorId, ...memberIds]
      .map((id) => id.toString())
      .filter((v, i, a) => a.indexOf(v) === i)
      .map((id) => new Types.ObjectId(id));

    const leaderId = dto.teamLeader
      ? new Types.ObjectId(dto.teamLeader)
      : creatorId;

    const payload: Partial<Team> = {
      name: dto.name,
      description: dto.description ?? '',
      createdBy: creatorId,
      members: uniqueMembers,
      tasks: (dto.tasks ?? []).map((t) => new Types.ObjectId(t)),
      isActive: dto.isActive ?? true,
      teamLeader: leaderId,
    } as const;
    return this.teamRepository.create(payload);
  }

  findAll(): Promise<TeamDocument[]> {
    const filter: FilterQuery<TeamDocument> = { deletedAt: null };
    return this.teamRepository.findAll(filter, { sort: { createdAt: -1 } });
  }

  findAllWithPagination(query: QueryTeamDto) {
    const filter: any = { deletedAt: null };
    if (query.search) {
      filter.name = { $regex: query.search, $options: 'i' };
    }
    if (query.createdBy) {
      filter.createdBy = new Types.ObjectId(query.createdBy);
    }
    if (query.teamLeader) {
      filter.teamLeader = new Types.ObjectId(query.teamLeader);
    }
    if (query.memberId) {
      filter.members = new Types.ObjectId(query.memberId);
    }
    if (typeof query.isActive === 'boolean') {
      filter.isActive = query.isActive;
    }

    return this.teamRepository.findWithPagination({
      filter,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: { createdAt: -1 },
    });
  }

  async findOne(id: string): Promise<TeamDocument> {
    const filter: FilterQuery<TeamDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const team = await this.teamRepository.findOne(filter);
    if (!team) throw new NotFoundException('Team not found');
    return team;
  }

  async update(id: string, dto: UpdateTeamDto): Promise<TeamDocument> {
    const updatePayload: UpdateQuery<TeamDocument> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.isActive !== undefined) updatePayload.isActive = dto.isActive;
    if (dto.createdBy !== undefined)
      updatePayload.createdBy = new Types.ObjectId(dto.createdBy);
    if (dto.teamLeader !== undefined)
      updatePayload.teamLeader = dto.teamLeader
        ? new Types.ObjectId(dto.teamLeader)
        : undefined;
    if (dto.members !== undefined)
      updatePayload.members = dto.members.map((m) => new Types.ObjectId(m));
    if (dto.tasks !== undefined)
      updatePayload.tasks = dto.tasks.map((t) => new Types.ObjectId(t));

    const filter: FilterQuery<TeamDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const updated = await this.teamRepository.findOneAndUpdate(
      filter,
      updatePayload,
    );
    if (!updated) throw new NotFoundException('Team not found');
    return updated;
  }

  async softDelete(id: string): Promise<{ success: boolean }> {
    const filter: FilterQuery<TeamDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const update: UpdateQuery<TeamDocument> = {
      deletedAt: new Date() as any,
      isActive: false,
    };
    const updated = await this.teamRepository.findOneAndUpdate(filter, update);
    if (!updated) throw new NotFoundException('Team not found');
    return { success: true };
  }
}
