import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TeamDocument = Team &
  Document & {
    _id: Types.ObjectId;
  };

@Schema({
  timestamps: true,
})
export class Team {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  teamLeader?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Task', default: [] })
  tasks: Types.ObjectId[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
