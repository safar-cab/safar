import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LocationDocument = LocationHistory & Document;

@Schema({ timestamps: true })
export class LocationHistory {
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, index: true })
  booking: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver: Types.ObjectId;

  @Prop({ required: true })
  latitude: number;

  @Prop({ required: true })
  longitude: number;

  @Prop()
  speed: number;

  @Prop()
  heading: number;

  @Prop()
  accuracy: number;

  @Prop({
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
  })
  point: { type: string; coordinates: number[] };
}

export const LocationHistorySchema = SchemaFactory.createForClass(LocationHistory);
LocationHistorySchema.index({ booking: 1, createdAt: -1 });
LocationHistorySchema.index({ point: '2dsphere' });
