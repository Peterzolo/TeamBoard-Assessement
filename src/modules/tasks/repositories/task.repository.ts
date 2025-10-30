import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Task, TaskDocument } from '../entities/task.entity';

@Injectable()
export class TaskRepository extends BaseRepository<TaskDocument, Task> {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>,
  ) {
    super(taskModel);
  }
}
