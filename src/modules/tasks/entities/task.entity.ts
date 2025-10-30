import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task &
  Document & {
    _id: Types.ObjectId;
  };

export enum TaskStatus {
  TODO = 'Todo',
  IN_PROGRESS = 'In-progress',
  DONE = 'Done',
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum TaskReviewStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  CHANGES_REQUIRED = 'Changes-required',
}

export class TaskReviewEntry {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reviewer: Types.ObjectId;

  @Prop({ type: String, required: true, trim: true })
  comment: string;

  @Prop({
    type: String,
    enum: TaskReviewStatus,
    default: TaskReviewStatus.PENDING,
  })
  status: TaskReviewStatus;

  @Prop({ type: Date, default: () => new Date() })
  createdAt: Date;
}

@Schema({ timestamps: true })
export class Task {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  project: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assignees: Types.ObjectId[];

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop({ type: Date, default: null })
  dueDate?: Date | null;

  @Prop({
    type: String,
    enum: TaskReviewStatus,
    default: TaskReviewStatus.PENDING,
  })
  reviewStatus: TaskReviewStatus;

  @Prop({ type: Date, default: null })
  lastReviewedAt?: Date | null;

  @Prop({ type: [TaskReviewEntry], default: [] })
  reviews: TaskReviewEntry[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
