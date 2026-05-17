import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RatingsService } from './ratings.service';
import {
  CustomerRatingsController,
  DriverRatingsController,
} from './ratings.controller';
import { Rating, RatingSchema } from '../schemas/rating.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Rating.name, schema: RatingSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
  ],
  controllers: [CustomerRatingsController, DriverRatingsController],
  providers: [RatingsService],
  exports: [RatingsService],
})
export class RatingsModule {}
