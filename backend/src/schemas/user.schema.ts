import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  CUSTOMER = 'customer',
  DRIVER = 'driver',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true, index: true })
  phone: string;

  @ApiProperty()
  @Prop({ sparse: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @ApiProperty()
  @Prop()
  profilePhoto: string;

  @ApiProperty({ enum: UserRole })
  @Prop({ type: String, enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Prop({ default: false })
  isBlocked: boolean;

  @Prop()
  blockReason: string;

  @Prop({ type: Object })
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @Prop({ type: [String], default: [] })
  fcmTokens: string[];

  @Prop()
  lastLogin: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ role: 1 });
