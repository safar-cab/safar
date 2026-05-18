import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StateDocument = State & Document;
export type CityDocument = City & Document;

@Schema({ timestamps: true })
export class State {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const StateSchema = SchemaFactory.createForClass(State);

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'State', required: true, index: true })
  state: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ type: [Number] })
  coordinates: number[];
}

export const CitySchema = SchemaFactory.createForClass(City);
CitySchema.index({ name: 1, state: 1 }, { unique: true });
