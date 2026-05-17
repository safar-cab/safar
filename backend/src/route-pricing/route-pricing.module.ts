import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutePricingService } from './route-pricing.service';
import {
  CustomerRoutesController,
  AdminRoutesController,
} from './route-pricing.controller';
import {
  RoutePricing,
  RoutePricingSchema,
} from '../schemas/route-pricing.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoutePricing.name, schema: RoutePricingSchema },
    ]),
  ],
  controllers: [CustomerRoutesController, AdminRoutesController],
  providers: [RoutePricingService],
  exports: [RoutePricingService],
})
export class RoutePricingModule {}
