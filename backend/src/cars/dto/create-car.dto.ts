import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';
import { CarCategory } from '../../schemas/car.schema';

export class CreateCarDto {
  @ApiProperty({ example: 'MP09AB1234' })
  @IsString()
  @IsNotEmpty()
  registrationNumber: string;

  @ApiProperty({ example: 'Maruti' })
  @IsString()
  @IsNotEmpty()
  make: string;

  @ApiProperty({ example: 'Swift Dzire' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiPropertyOptional({ example: 2023 })
  @IsOptional()
  @IsNumber()
  year?: number;

  @ApiPropertyOptional({ example: 'White' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ enum: CarCategory, example: CarCategory.SEDAN })
  @IsEnum(CarCategory)
  category: CarCategory;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  seats?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  photos?: string[];
}
