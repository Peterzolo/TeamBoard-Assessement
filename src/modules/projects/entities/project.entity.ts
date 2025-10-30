import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project &
  Document & {
    _id: Types.ObjectId;
  };

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: false, trim: true, default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: false, index: true })
  team?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: false, index: true })
  projectManager?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'Task', default: [] })
  tasks: Types.ObjectId[];

  @Prop({ type: Boolean, default: true, index: true })
  isActive: boolean;

  @Prop({ type: Date, default: null, index: true })
  deletedAt?: Date | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
