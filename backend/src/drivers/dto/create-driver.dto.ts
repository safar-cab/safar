import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({ description: 'User ID of the driver' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'DL1234567890' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  licensePhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  aadhaarPhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  photo?: string;
}
