import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType, NotificationChannel } from './notification.entity';

export enum TemplateStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  DRAFT = 'draft',
}

@Schema({ timestamps: true })
export class NotificationTemplate extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, type: String, enum: Object.values(NotificationType) })
  type: NotificationType;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NotificationChannel),
  })
  channel: NotificationChannel;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: String })
  htmlContent?: string;

  @Prop({ type: [String], default: [] })
  variables: string[]; // List of variables that can be used in the template

  @Prop({
    type: String,
    enum: Object.values(TemplateStatus),
    default: TemplateStatus.ACTIVE,
  })
  status: TemplateStatus;

  @Prop({ type: String })
  description?: string;

  @Prop({ type: Object, default: {} })
  defaultData?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Date })
  lastUsedAt?: Date;

  @Prop({ type: Number, default: 0 })
  usageCount: number;

  // Timestamps
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationTemplateSchema =
  SchemaFactory.createForClass(NotificationTemplate);

// Indexes
NotificationTemplateSchema.index({ type: 1, channel: 1, status: 1 });
// name index is already defined in @Prop decorator with unique: true
