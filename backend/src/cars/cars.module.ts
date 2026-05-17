import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CarsService } from './cars.service';
import { CustomerCarsController, AdminCarsController } from './cars.controller';
import { Car, CarSchema } from '../schemas/car.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Car.name, schema: CarSchema }])],
  controllers: [CustomerCarsController, AdminCarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
