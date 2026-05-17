import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ description: 'User ID of the driver' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  // Personal
  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'male' })
  @IsOptional()
  @IsString()
  gender?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  currentAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  permanentAddress?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  // Documents
  @ApiProperty({ example: 'DL1234567890' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional({ example: 'LMV' })
  @IsOptional()
  @IsString()
  licenseType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  licensePhotos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  aadhaarPhotos?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  panPhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policeVerificationPhoto?: string;

  // Banking
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    accountHolderName: string;
    upiId?: string;
  };

  // Experience
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  vehicleTypesComfortable?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  languagesSpoken?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  knowsLocalRoutes?: boolean;

  // Employment
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  previousEmployer?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  reference?: { name: string; phone: string };

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  expectedSalary?: number;

  @ApiPropertyOptional({ example: 'flexible' })
  @IsOptional()
  @IsString()
  availableShift?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  joinDate?: string;
}
