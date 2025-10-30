import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User &
  Document & {
    _id: Types.ObjectId;
  };

export enum UserRole {
  SUPER_ADMIN = 'Super-admin',
  ADMIN = 'Admin',
  PROJECT_MANAGER = 'Project-manager',
  TEAM_MEMBER = 'Team-member',
  TEAM_LEAD = 'Team-lead',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: false })
  firstName?: string;

  @Prop({ required: false })
  lastName?: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, select: false })
  password?: string;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: String, select: false, default: null })
  emailVerificationToken?: string | null;

  @Prop({ type: String, select: false, default: null })
  passwordResetToken?: string | null;

  @Prop({ type: Date, select: false, default: null })
  passwordResetExpires?: Date | null;

  @Prop({
    type: String,
    enum: UserRole,
    required: true,
  })
  role: UserRole;
}

export const UserSchema = SchemaFactory.createForClass(User);
