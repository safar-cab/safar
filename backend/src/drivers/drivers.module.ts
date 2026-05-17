import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DriversService } from './drivers.service';
import {
  DriverSelfController,
  AdminDriversController,
} from './drivers.controller';
import { Driver, DriverSchema } from '../schemas/driver.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Driver.name, schema: DriverSchema }]),
  ],
  controllers: [DriverSelfController, AdminDriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
