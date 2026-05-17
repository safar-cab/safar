import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_EN_ROUTE = 'driver_en_route',
  PICKED_UP = 'picked_up',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Schema({ timestamps: true })
export class Booking {
  @ApiProperty()
  @Prop({ unique: true })
  bookingId: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Driver', index: true })
  driver: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  car: Types.ObjectId;

  @Prop({
    type: {
      address: String,
      coordinates: { type: { type: String }, coordinates: [Number] },
      landmark: String,
    },
  })
  pickup: {
    address: string;
    coordinates: { type: string; coordinates: number[] };
    landmark: string;
  };

  @Prop({
    type: {
      address: String,
      coordinates: { type: { type: String }, coordinates: [Number] },
      landmark: String,
    },
  })
  drop: {
    address: string;
    coordinates: { type: string; coordinates: number[] };
    landmark: string;
  };

  @Prop({
    type: [
      {
        order: Number,
        address: String,
        coordinates: { type: { type: String }, coordinates: [Number] },
        status: { type: String, enum: ['pending', 'reached', 'skipped'] },
        reachedAt: Date,
      },
    ],
    default: [],
  })
  stops: Array<{
    order: number;
    address: string;
    coordinates: { type: string; coordinates: number[] };
    status: string;
    reachedAt: Date;
  }>;

  @Prop({
    type: {
      startDate: Date,
      startTime: String,
      endDate: Date,
      endTime: String,
    },
  })
  schedule: {
    startDate: Date;
    startTime: string;
    endDate: Date;
    endTime: string;
  };

  @Prop({
    type: {
      estimated: Number,
      actual: Number,
    },
  })
  distance: {
    estimated: number;
    actual: number;
  };

  @Prop({
    type: {
      pricePerKm: Number,
      baseFare: Number,
      distanceCharge: Number,
      tollEstimate: Number,
      cgst: Number,
      sgst: Number,
      gstAmount: Number,
      totalAmount: Number,
    },
  })
  pricing: {
    pricePerKm: number;
    baseFare: number;
    distanceCharge: number;
    tollEstimate: number;
    cgst: number;
    sgst: number;
    gstAmount: number;
    totalAmount: number;
  };

  @ApiProperty({ enum: BookingStatus })
  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
    index: true,
  })
  status: BookingStatus;

  @Prop({
    type: {
      cancelledBy: String,
      reason: String,
      cancelledAt: Date,
      refundPolicy: String,
      refundPercentage: Number,
      refundAmount: Number,
    },
  })
  cancellation: {
    cancelledBy: string;
    reason: string;
    cancelledAt: Date;
    refundPolicy: string;
    refundPercentage: number;
    refundAmount: number;
  };

  @Prop({
    type: {
      driverStarted: Date,
      pickedUp: Date,
      completed: Date,
    },
  })
  actualTimes: {
    driverStarted: Date;
    pickedUp: Date;
    completed: Date;
  };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
BookingSchema.index({ car: 1, status: 1, 'schedule.startDate': 1 });
BookingSchema.index({ user: 1, createdAt: -1 });
BookingSchema.index({ driver: 1, status: 1 });
