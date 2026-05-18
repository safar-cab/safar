import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { State, StateSchema, City, CitySchema } from '../schemas/geo.schema';
import {
  RoutePricing,
  RoutePricingSchema,
} from '../schemas/route-pricing.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { LocationsService } from './locations.service';
import {
  PublicLocationsController,
  AdminLocationsController,
} from './locations.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: State.name, schema: StateSchema },
      { name: City.name, schema: CitySchema },
      { name: RoutePricing.name, schema: RoutePricingSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [PublicLocationsController, AdminLocationsController],
  providers: [LocationsService],
  exports: [LocationsService],
})
export class LocationsModule {}
