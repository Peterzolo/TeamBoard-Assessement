import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { NotificationType, NotificationChannel } from './notification.entity';

@Schema({ timestamps: true })
export class NotificationPreference extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  emailPreferences: Map<NotificationType, boolean>;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  inAppPreferences: Map<NotificationType, boolean>;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  pushPreferences: Map<NotificationType, boolean>;

  @Prop({ type: Map, of: Boolean, default: new Map() })
  smsPreferences: Map<NotificationType, boolean>;

  @Prop({ type: Boolean, default: true })
  emailEnabled: boolean;

  @Prop({ type: Boolean, default: true })
  inAppEnabled: boolean;

  @Prop({ type: Boolean, default: true })
  pushEnabled: boolean;

  @Prop({ type: Boolean, default: false })
  smsEnabled: boolean;

  @Prop({ type: Boolean, default: true })
  digestEnabled: boolean; // Daily/weekly digest of notifications

  @Prop({
    type: String,
    enum: ['immediate', 'hourly', 'daily', 'weekly'],
    default: 'immediate',
  })
  digestFrequency: string;

  @Prop({ type: [String], default: [] })
  quietHours: string[]; // Times when notifications should be quiet (e.g., ["22:00-08:00"])

  @Prop({ type: String, default: 'UTC' })
  timezone: string;

  @Prop({ type: Object, default: {} })
  customSettings: Record<string, any>;

  // Timestamps
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;
}

export const NotificationPreferenceSchema = SchemaFactory.createForClass(
  NotificationPreference,
);

// Indexes
// userId index is already defined in @Prop decorator with unique: true
