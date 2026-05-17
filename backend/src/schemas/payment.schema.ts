import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  CREATED = 'created',
  AUTHORIZED = 'authorized',
  CAPTURED = 'captured',
  REFUNDED = 'refunded',
  PARTIAL_REFUND = 'partial_refund',
  FAILED = 'failed',
}

@Schema({ timestamps: true })
export class Payment {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true, index: true })
  booking: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;

  @Prop({
    type: {
      orderId: String,
      paymentId: String,
      signature: String,
    },
  })
  razorpay: {
    orderId: string;
    paymentId: string;
    signature: string;
  };

  @ApiProperty()
  @Prop({ required: true })
  amount: number; // in paise

  @ApiProperty()
  @Prop({ default: 'INR' })
  currency: string;

  @ApiProperty()
  @Prop({ default: 'upi' })
  method: string;

  @Prop()
  upiId: string;

  @ApiProperty({ enum: PaymentStatus })
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.CREATED })
  status: PaymentStatus;

  @Prop({
    type: {
      refundId: String,
      amount: Number,
      status: String,
      processedAt: Date,
    },
  })
  refund: {
    refundId: string;
    amount: number;
    status: string;
    processedAt: Date;
  };

  @Prop()
  paidAt: Date;

  @Prop()
  paymentLinkToken: string;

  @Prop()
  paymentLinkExpiry: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ 'razorpay.orderId': 1 });
