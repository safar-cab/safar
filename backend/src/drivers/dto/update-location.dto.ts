import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateLocationDto {
  @ApiProperty({ example: 22.7196 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 75.8577 })
  @IsNumber()
  longitude: number;
}
