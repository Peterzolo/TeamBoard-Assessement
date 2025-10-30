import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskReviewStatus } from '../entities/task.entity';

export class AddReviewDto {
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;

  @IsEnum(TaskReviewStatus)
  @IsOptional()
  status?: TaskReviewStatus;
}
