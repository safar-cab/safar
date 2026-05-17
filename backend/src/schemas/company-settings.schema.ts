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
  defaultRefundPolicy: Record<string, unknown>;

  @Prop()
  razorpayKeyId: string;

  @Prop()
  upiMerchantId: string;

  @Prop({ type: Object })
  socialLinks: Record<string, string>;

  @Prop({ type: Object })
  paymentSettings: {
    razorpayKeyId: string;
    razorpayKeySecret: string;
    webhookSecret: string;
  };

  @Prop({ type: Object })
  emailSettings: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpFrom: string;
  };
}

export const CompanySettingsSchema =
  SchemaFactory.createForClass(CompanySettings);
