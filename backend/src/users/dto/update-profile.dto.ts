import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Sourabh Sen' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'sourabh@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profilePhoto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}
