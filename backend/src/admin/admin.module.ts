import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminService } from './admin.service';
import { AdminDashboardController } from './admin.controller';
import { User, UserSchema } from '../schemas/user.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Car, CarSchema } from '../schemas/car.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import {
  CompanySettings,
  CompanySettingsSchema,
} from '../schemas/company-settings.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Car.name, schema: CarSchema },
      { name: Driver.name, schema: DriverSchema },
      { name: CompanySettings.name, schema: CompanySettingsSchema },
    ]),
  ],
  controllers: [AdminDashboardController],
  providers: [AdminService],
})
export class AdminModule {}
