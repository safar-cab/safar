import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderDto {
  @ApiProperty({ description: 'Booking ID (MongoDB _id)' })
  @IsString()
  @IsNotEmpty()
  bookingId: string;
}
