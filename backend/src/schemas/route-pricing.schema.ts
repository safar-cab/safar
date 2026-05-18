import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RoutePricingDocument = RoutePricing & Document;

@Schema({ timestamps: true })
export class RoutePricing {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @Prop({ type: { name: String, state: String, coordinates: [Number] } })
  fromCity: { name: string; state: string; coordinates: number[] };

  @Prop({ type: { name: String, state: String, coordinates: [Number] } })
  toCity: { name: string; state: string; coordinates: number[] };

  @Prop({ type: Types.ObjectId, ref: 'City', index: true })
  fromCityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'State', index: true })
  fromStateId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'City', index: true })
  toCityId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'State', index: true })
  toStateId: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  distanceKm: number;

  @ApiProperty()
  @Prop({ required: true })
  pricePerKm: number;

  @ApiProperty()
  @Prop({ default: 0 })
  baseFare: number;

  @ApiProperty()
  @Prop({ default: 0 })
  tollEstimate: number;

  @ApiProperty()
  @Prop({
    type: String,
    enum: ['full', 'partial', 'time_based'],
    default: 'full',
  })
  refundPolicy: string;

  @Prop({ type: Object })
  refundConfig: Record<string, any>;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;
}

export const RoutePricingSchema = SchemaFactory.createForClass(RoutePricing);
