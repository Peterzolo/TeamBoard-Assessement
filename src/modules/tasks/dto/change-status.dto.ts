import { IsEnum } from 'class-validator';
import { TaskStatus } from '../entities/task.entity';

export class ChangeStatusDto {
  @IsEnum(TaskStatus)
  status: TaskStatus;
}
