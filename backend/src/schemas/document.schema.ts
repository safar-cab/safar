import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document as MongoDoc, Types } from 'mongoose';

export type DocumentDocument = VerificationDocument & MongoDoc;

export enum DocEntityType {
  DRIVER = 'driver',
  CAR = 'car',
}

export enum DocType {
  DRIVING_LICENSE = 'driving_license',
  AADHAAR = 'aadhaar',
  PAN = 'pan',
  CAR_RC = 'car_rc',
  INSURANCE = 'insurance',
  PERMIT = 'permit',
  FITNESS_CERTIFICATE = 'fitness_certificate',
  POLLUTION_CERTIFICATE = 'pollution_certificate',
  PHOTO = 'photo',
  OTHER = 'other',
}

export enum DocStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class VerificationDocument {
  @Prop({ type: String, enum: DocEntityType, required: true, index: true })
  entityType: DocEntityType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  entityId: Types.ObjectId;

  @Prop({ type: String, enum: DocType, required: true })
  docType: DocType;

  @Prop({ required: true })
  fileUrl: string;

  @Prop()
  fileName: string;

  @Prop({ type: String, enum: DocStatus, default: DocStatus.PENDING, index: true })
  status: DocStatus;

  @Prop()
  expiryDate: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy: Types.ObjectId;

  @Prop()
  verifiedAt: Date;

  @Prop()
  rejectionReason: string;

  @Prop()
  notes: string;

  @Prop()
  documentNumber: string;
}

export const VerificationDocumentSchema = SchemaFactory.createForClass(VerificationDocument);
VerificationDocumentSchema.index({ entityType: 1, entityId: 1, docType: 1 });
VerificationDocumentSchema.index({ status: 1, expiryDate: 1 });
