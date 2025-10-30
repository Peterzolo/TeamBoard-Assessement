import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum NotificationType {
  // Billing Document Notifications
  BILLING_DOCUMENT_CREATED = 'billing_document_created',
  BILLING_DOCUMENT_SUBMITTED = 'billing_document_submitted',
  BILLING_DOCUMENT_APPROVED = 'billing_document_approved',
  BILLING_DOCUMENT_REJECTED = 'billing_document_rejected',
  BILLING_DOCUMENT_SENT = 'billing_document_sent',

  // Service Request Notifications
  SERVICE_REQUEST_CREATED = 'service_request_created',
  SERVICE_REQUEST_UPDATED = 'service_request_updated',
  SERVICE_REQUEST_APPROVED = 'service_request_approved',
  SERVICE_REQUEST_REJECTED = 'service_request_rejected',
  SERVICE_REQUEST_IN_PROGRESS = 'service_request_in_progress',
  SERVICE_REQUEST_COMPLETED = 'service_request_completed',
  SERVICE_REQUEST_CANCELLED = 'service_request_cancelled',
  SERVICE_REQUEST_DELETED = 'service_request_deleted',
  SERVICE_REQUEST_RESTORED = 'service_request_restored',

  // Payment Notifications
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_UPDATED = 'payment_updated',
  PAYMENT_VERIFIED = 'payment_verified',
  PAYMENT_REJECTED = 'payment_rejected',

  // User Profile Notifications
  PROFILE_UPDATED = 'profile_updated',
}

export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true, type: String, enum: Object.values(NotificationType) })
  type: NotificationType;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NotificationChannel),
  })
  channel: NotificationChannel;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NotificationPriority),
    default: NotificationPriority.MEDIUM,
  })
  priority: NotificationPriority;

  @Prop({
    required: true,
    type: String,
    enum: Object.values(NotificationStatus),
    default: NotificationStatus.PENDING,
  })
  status: NotificationStatus;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  data?: Record<string, any>;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy: Types.ObjectId[];

  @Prop({ type: Date })
  scheduledFor?: Date;

  @Prop({ type: Date })
  sentAt?: Date;

  @Prop({ type: Date })
  deliveredAt?: Date;

  @Prop({ type: Date })
  readAt?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: String })
  errorMessage?: string;

  @Prop({ type: Number, default: 0 })
  retryCount: number;

  @Prop({ type: Number, default: 3 })
  maxRetries: number;

  @Prop({ type: String })
  templateId?: string;

  @Prop({ type: Object, default: {} })
  templateData?: Record<string, any>;

  @Prop({ type: String })
  externalId?: string; // For tracking external service IDs

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;

  // Timestamps
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for better performance
NotificationSchema.index({ recipientId: 1, status: 1 });
NotificationSchema.index({ type: 1, channel: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ scheduledFor: 1 });
NotificationSchema.index({ expiresAt: 1 });
