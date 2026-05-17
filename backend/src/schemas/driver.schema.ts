import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @ApiProperty()
  @Prop({ unique: true })
  licenseNumber: string;

  @Prop()
  licensePhoto: string;

  @Prop()
  licenseExpiry: Date;

  @Prop()
  aadhaarNumber: string;

  @Prop()
  aadhaarPhoto: string;

  @Prop()
  photo: string;

  @ApiProperty()
  @Prop({ default: false })
  isVerified: boolean;

  @ApiProperty()
  @Prop({ default: true })
  isAvailable: boolean;

  @ApiProperty()
  @Prop({ default: 0 })
  avgRating: number;

  @ApiProperty()
  @Prop({ default: 0 })
  totalRides: number;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: { type: [Number], default: [0, 0] },
  })
  currentLocation: {
    type: string;
    coordinates: number[];
  };
}

export const DriverSchema = SchemaFactory.createForClass(Driver);
DriverSchema.index({ userId: 1 });
DriverSchema.index({ isAvailable: 1 });
DriverSchema.index({ currentLocation: '2dsphere' });
