import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LookupService } from './lookup.service';
import { LookupController } from './lookup.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Car, CarSchema } from '../schemas/car.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import {
  RoutePricing,
  RoutePricingSchema,
} from '../schemas/route-pricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Car.name, schema: CarSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: RoutePricing.name, schema: RoutePricingSchema },
    ]),
  ],
  controllers: [LookupController],
  providers: [LookupService],
})
export class LookupModule {}
