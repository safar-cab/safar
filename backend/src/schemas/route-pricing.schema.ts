import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RoutePricingDocument = RoutePricing & Document;

@Schema({ timestamps: true })
export class RoutePricing {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @Prop({ type: { name: String, coordinates: [Number] } })
  fromCity: { name: string; coordinates: number[] };

  @Prop({ type: { name: String, coordinates: [Number] } })
  toCity: { name: string; coordinates: number[] };

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
