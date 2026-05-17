import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DriverDocument = Driver & Document;

@Schema({ timestamps: true })
export class Driver {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Personal
  @Prop()
  dateOfBirth: Date;

  @Prop()
  gender: string;

  @Prop()
  fatherName: string;

  @Prop()
  photo: string;

  @Prop({
    type: { street: String, city: String, state: String, pincode: String },
  })
  currentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @Prop({
    type: { street: String, city: String, state: String, pincode: String },
  })
  permanentAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @Prop({ type: { name: String, phone: String, relation: String } })
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };

  // Documents
  @ApiProperty()
  @Prop({ unique: true })
  licenseNumber: string;

  @Prop()
  licenseType: string; // LMV, HMV, BOTH

  @Prop()
  licenseExpiry: Date;

  @Prop({ type: [String], default: [] })
  licensePhotos: string[]; // front + back

  @Prop()
  aadhaarNumber: string;

  @Prop({ type: [String], default: [] })
  aadhaarPhotos: string[]; // front + back

  @Prop()
  panNumber: string;

  @Prop()
  panPhoto: string;

  @Prop()
  policeVerificationPhoto: string;

  // Banking
  @Prop({
    type: {
      accountNumber: String,
      ifscCode: String,
      bankName: String,
      accountHolderName: String,
      upiId: String,
    },
  })
  bankDetails: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
    upiId: string;
  };

  // Experience
  @Prop()
  yearsOfExperience: number;

  @Prop({ type: [String], default: [] })
  vehicleTypesComfortable: string[]; // sedan, suv, tempo, etc.

  @Prop({ type: [String], default: [] })
  languagesSpoken: string[];

  @Prop()
  knowsLocalRoutes: boolean;

  // Employment
  @Prop()
  previousEmployer: string;

  @Prop({ type: { name: String, phone: String } })
  reference: { name: string; phone: string };

  @Prop()
  expectedSalary: number;

  @Prop()
  availableShift: string; // morning, evening, night, flexible

  @Prop()
  joinDate: Date;

  // System fields
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
DriverSchema.index({ isAvailable: 1 });
DriverSchema.index({ currentLocation: '2dsphere' });
