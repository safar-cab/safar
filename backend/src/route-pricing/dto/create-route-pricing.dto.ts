import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsObject,
} from 'class-validator';

export class CreateRoutePricingDto {
  @ApiProperty({ example: 'Indore to Bhopal' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  fromCity?: { name: string; coordinates: number[] };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  toCity?: { name: string; coordinates: number[] };

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromCityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fromStateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toCityId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  toStateId?: string;

  @ApiProperty({ example: 195 })
  @IsNumber()
  distanceKm: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  pricePerKm: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  baseFare?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  tollEstimate?: number;

  @ApiPropertyOptional({ example: 'full' })
  @IsOptional()
  @IsString()
  refundPolicy?: string;
}
