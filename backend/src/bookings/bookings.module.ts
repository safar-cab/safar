import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsService } from './bookings.service';
import {
  CustomerBookingsController,
  DriverBookingsController,
  AdminBookingsController,
} from './bookings.controller';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import {
  CompanySettings,
  CompanySettingsSchema,
} from '../schemas/company-settings.schema';
import {
  RoutePricing,
  RoutePricingSchema,
} from '../schemas/route-pricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: User.name, schema: UserSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: CompanySettings.name, schema: CompanySettingsSchema },
      { name: RoutePricing.name, schema: RoutePricingSchema },
    ]),
  ],
  controllers: [
    CustomerBookingsController,
    DriverBookingsController,
    AdminBookingsController,
  ],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
