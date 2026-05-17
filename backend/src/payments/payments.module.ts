import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import {
  CustomerPaymentsController,
  AdminPaymentsController,
  WebhooksController,
} from './payments.controller';
import { Payment, PaymentSchema } from '../schemas/payment.schema';
import { Booking, BookingSchema } from '../schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [
    CustomerPaymentsController,
    AdminPaymentsController,
    WebhooksController,
  ],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
