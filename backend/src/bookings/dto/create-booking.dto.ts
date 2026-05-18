import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @ApiProperty({ example: 'Vijay Nagar, Indore' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiPropertyOptional({ example: [75.8577, 22.7196] })
  @IsOptional()
  @IsArray()
  coordinates?: number[];

  @ApiPropertyOptional({ example: 'Near C21 Mall' })
  @IsOptional()
  @IsString()
  landmark?: string;
}

class StopDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'Dewas Naka' })
  @IsString()
  address: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  coordinates?: number[];
}

class ScheduleDto {
  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '09:00' })
  @IsString()
  startTime: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  endTime?: string;
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Car ID' })
  @IsString()
  @IsNotEmpty()
  carId: string;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  pickup: LocationDto;

  @ApiProperty({ type: LocationDto })
  @ValidateNested()
  @Type(() => LocationDto)
  drop: LocationDto;

  @ApiPropertyOptional({ type: [StopDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StopDto)
  stops?: StopDto[];

  @ApiProperty({ type: ScheduleDto })
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  estimatedDistanceKm?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  tollEstimate?: number;
}
