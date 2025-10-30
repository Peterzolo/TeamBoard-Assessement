import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SequenceCounter extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, default: 0 })
  value: number;

  @Prop({ required: false })
  description?: string;

  @Prop({ required: false })
  prefix?: string;

  @Prop({ required: false })
  year?: number;
}

export const SequenceCounterSchema =
  SchemaFactory.createForClass(SequenceCounter);

export type SequenceCounterDocument = SequenceCounter & Document;






