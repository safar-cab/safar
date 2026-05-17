import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CarDocument = Car & Document;

export enum CarCategory {
  SEDAN = 'sedan',
  SUV = 'suv',
  HATCHBACK = 'hatchback',
  TEMPO_TRAVELLER = 'tempo_traveller',
  LUXURY = 'luxury',
}

@Schema({ timestamps: true })
export class Car {
  @ApiProperty()
  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @ApiProperty()
  @Prop({ required: true })
  make: string;

  @ApiProperty()
  @Prop({ required: true })
  model: string;

  @ApiProperty()
  @Prop()
  year: number;

  @ApiProperty()
  @Prop()
  color: string;

  @ApiProperty({ enum: CarCategory })
  @Prop({ type: String, enum: CarCategory, required: true })
  category: CarCategory;

  @ApiProperty()
  @Prop({ default: 4 })
  seats: number;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop({
    type: {
      rc: { url: String, expiry: Date },
      insurance: { url: String, expiry: Date },
      puc: { url: String, expiry: Date },
      fitness: { url: String, expiry: Date },
    },
  })
  documents: {
    rc: { url: string; expiry: Date };
    insurance: { url: string; expiry: Date };
    puc: { url: string; expiry: Date };
    fitness: { url: string; expiry: Date };
  };

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  assignedDriver: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  gpsDeviceId: string;

  @Prop({
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: { type: [Number], default: [0, 0] },
  })
  lastKnownLocation: {
    type: string;
    coordinates: number[];
  };
}

export const CarSchema = SchemaFactory.createForClass(Car);
CarSchema.index({ registrationNumber: 1 });
CarSchema.index({ category: 1 });
CarSchema.index({ isActive: 1 });
