import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CompanySettingsDocument = CompanySettings & Document;

@Schema({ timestamps: true })
export class CompanySettings {
  @ApiProperty()
  @Prop({ required: true })
  companyName: string;

  @Prop()
  logo: string;

  @ApiProperty()
  @Prop()
  phone: string;

  @ApiProperty()
  @Prop()
  email: string;

  @Prop()
  address: string;

  @ApiProperty()
  @Prop({ default: 12 })
  defaultPricePerKm: number;

  @Prop({ type: Object })
  defaultRefundPolicy: Record<string, any>;

  @Prop()
  razorpayKeyId: string;

  @Prop()
  upiMerchantId: string;

  @Prop({ type: Object })
  socialLinks: Record<string, string>;
}

export const CompanySettingsSchema =
  SchemaFactory.createForClass(CompanySettings);
