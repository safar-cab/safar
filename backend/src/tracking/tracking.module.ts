import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LocationHistory, LocationHistorySchema } from '../schemas/location.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { TrackingController } from './tracking.controller';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LocationHistory.name, schema: LocationHistorySchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
    BookingsModule,
  ],
  controllers: [TrackingController],
  providers: [TrackingService, TrackingGateway],
  exports: [TrackingService],
})
export class TrackingModule {}
