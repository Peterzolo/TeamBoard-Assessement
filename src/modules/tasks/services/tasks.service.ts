import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterQuery, Types, UpdateQuery } from 'mongoose';
import { TaskRepository } from '../repositories/task.repository';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import {
  Task,
  TaskDocument,
  TaskPriority,
  TaskReviewStatus,
  TaskStatus,
} from '../entities/task.entity';
import { CurrentUser as CurrentUserType } from '../../auth/decorators/current-user.decorator';
import { AddReviewDto } from '../dto/add-review.dto';
import { ModifyAssigneesDto } from '../dto/modify-assignees.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { ChangePriorityDto } from '../dto/change-priority.dto';
import { Inject, Optional } from '@nestjs/common';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';
import { Queue } from 'bullmq';
import {
  taskAssignedTemplate,
  taskUnassignedTemplate,
} from '../../../core/templates/email/task-templates';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    @Optional()
    @Inject('IUserLookupService')
    private readonly userLookupService?: IUserLookupService,
    @Optional() @Inject('EMAIL_QUEUE') private readonly emailQueue?: Queue,
  ) {}

  create(
    dto: CreateTaskDto,
    currentUser: CurrentUserType,
  ): Promise<TaskDocument> {
    const payload: Partial<Task> = {
      title: dto.title,
      description: dto.description ?? '',
      project: new Types.ObjectId(dto.project),
      createdBy: new Types.ObjectId(currentUser._id),
      assignees: [],
      status: dto.status ?? TaskStatus.TODO,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      isActive: true,
      reviewStatus: TaskReviewStatus.PENDING,
      lastReviewedAt: null,
      reviews: [],
    };
    return this.taskRepository.create(payload);
  }

  findAll(): Promise<TaskDocument[]> {
    const filter: FilterQuery<TaskDocument> = { deletedAt: null };
    return this.taskRepository.findAll(filter, { sort: { createdAt: -1 } });
  }

  findAllWithPagination(query: QueryTaskDto) {
    const filter: any = { deletedAt: null };
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };
    if (query.project) filter.project = new Types.ObjectId(query.project);
    if (query.assignee) filter.assignees = new Types.ObjectId(query.assignee);
    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (typeof query.isActive === 'boolean') filter.isActive = query.isActive;

    return this.taskRepository.findWithPagination({
      filter,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      sort: { createdAt: -1 },
    });
  }

  async findOne(id: string): Promise<TaskDocument> {
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const task = await this.taskRepository.findOne(filter);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const updatePayload: UpdateQuery<TaskDocument> = {};
    if (dto.title !== undefined) updatePayload.title = dto.title;
    if (dto.description !== undefined)
      updatePayload.description = dto.description;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.priority !== undefined) updatePayload.priority = dto.priority;
    if (dto.dueDate !== undefined)
      updatePayload.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    if (dto.assignees !== undefined)
      updatePayload.assignees = dto.assignees.map((a) => new Types.ObjectId(a));

    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const updated = await this.taskRepository.findOneAndUpdate(
      filter,
      updatePayload,
    );
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async softDelete(id: string): Promise<{ success: boolean }> {
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const update: UpdateQuery<TaskDocument> = {
      deletedAt: new Date() as any,
      isActive: false,
    } as any;
    const updated = await this.taskRepository.findOneAndUpdate(filter, update);
    if (!updated) throw new NotFoundException('Task not found');
    return { success: true };
  }

  async addReview(
    id: string,
    dto: AddReviewDto,
    reviewer: CurrentUserType,
  ): Promise<TaskDocument> {
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
    };
    const now = new Date();
    const status = dto.status ?? TaskReviewStatus.PENDING;
    const update: UpdateQuery<TaskDocument> = {
      $push: {
        reviews: {
          reviewer: new Types.ObjectId(reviewer._id),
          comment: dto.comment ?? '',
          status,
          createdAt: now,
        },
      },
      reviewStatus: status,
      lastReviewedAt: now,
    } as any;
    const updated = await this.taskRepository.findOneAndUpdate(
      filter,
      update as any,
    );
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async addAssignees(
    id: string,
    dto: ModifyAssigneesDto,
  ): Promise<TaskDocument> {
    const assigneeIds = dto.assignees.map((a) => new Types.ObjectId(a));
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
      isActive: true,
    };
    const update: UpdateQuery<TaskDocument> = {
      $addToSet: { assignees: { $each: assigneeIds } } as any,
    } as any;
    const updated = await this.taskRepository.findOneAndUpdate(filter, update);
    // notify assignees
    if (updated && this.userLookupService && this.emailQueue) {
      const users = await Promise.all(
        dto.assignees.map((idStr) =>
          this.userLookupService.findUserById(idStr),
        ),
      );
      await Promise.all(
        users
          .filter((u): u is NonNullable<typeof u> => !!u)
          .map((u) => {
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
            const tpl = taskAssignedTemplate({
              userName: name,
              taskTitle: updated.title,
            });
            return this.emailQueue.add(
              'send-email',
              {
                to: u.email,
                subject: tpl.subject,
                html: tpl.html,
                type: 'task_assigned',
                data: { taskId: updated._id.toString() },
              },
              { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
            );
          }),
      );
    }
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async removeAssignees(
    id: string,
    dto: ModifyAssigneesDto,
  ): Promise<TaskDocument> {
    const assigneeIds = dto.assignees.map((a) => new Types.ObjectId(a));
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
      isActive: true,
    };
    const update: UpdateQuery<TaskDocument> = {
      $pullAll: { assignees: assigneeIds } as any,
    } as any;
    const updated = await this.taskRepository.findOneAndUpdate(filter, update);
    // notify unassigned
    if (updated && this.userLookupService && this.emailQueue) {
      const users = await Promise.all(
        dto.assignees.map((idStr) =>
          this.userLookupService.findUserById(idStr),
        ),
      );
      await Promise.all(
        users
          .filter((u): u is NonNullable<typeof u> => !!u)
          .map((u) => {
            const name =
              [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
            const tpl = taskUnassignedTemplate({
              userName: name,
              taskTitle: updated.title,
            });
            return this.emailQueue.add(
              'send-email',
              {
                to: u.email,
                subject: tpl.subject,
                html: tpl.html,
                type: 'task_unassigned',
                data: { taskId: updated._id.toString() },
              },
              { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
            );
          }),
      );
    }
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async changeStatus(id: string, dto: ChangeStatusDto): Promise<TaskDocument> {
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
      isActive: true,
    };
    const update: UpdateQuery<TaskDocument> = { status: dto.status } as any;
    const updated = await this.taskRepository.findOneAndUpdate(filter, update);
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }

  async changePriority(
    id: string,
    dto: ChangePriorityDto,
  ): Promise<TaskDocument> {
    const filter: FilterQuery<TaskDocument> = {
      _id: new Types.ObjectId(id),
      deletedAt: null,
      isActive: true,
    };
    const update: UpdateQuery<TaskDocument> = { priority: dto.priority } as any;
    const updated = await this.taskRepository.findOneAndUpdate(filter, update);
    if (!updated) throw new NotFoundException('Task not found');
    return updated;
  }
}
