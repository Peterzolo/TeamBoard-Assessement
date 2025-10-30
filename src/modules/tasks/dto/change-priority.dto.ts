import { IsEnum } from 'class-validator';
import { TaskPriority } from '../entities/task.entity';

export class ChangePriorityDto {
  @IsEnum(TaskPriority)
  priority: TaskPriority;
}
