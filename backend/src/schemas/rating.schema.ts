import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RatingDocument = Rating & Document;

@Schema({ timestamps: true })
export class Rating {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  fromUser: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  toUser: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: String, enum: ['customer', 'driver'], required: true })
  raterRole: string;

  @ApiProperty()
  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @ApiProperty()
  @Prop()
  review: string;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
RatingSchema.index({ booking: 1, fromUser: 1 }, { unique: true });
RatingSchema.index({ toUser: 1 });
