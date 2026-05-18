import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CarsModule } from './cars/cars.module';
import { DriversModule } from './drivers/drivers.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { RatingsModule } from './ratings/ratings.module';
import { RoutePricingModule } from './route-pricing/route-pricing.module';
import { AdminModule } from './admin/admin.module';
import { UploadModule } from './upload/upload.module';
import { EmailModule } from './email/email.module';
import { LookupModule } from './lookup/lookup.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DocumentsModule } from './documents/documents.module';
import { TrackingModule } from './tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI',
          'mongodb+srv://root:root@scaffold-stage.avxlqac.mongodb.net/books',
        ),
      }),
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UsersModule,
    CarsModule,
    DriversModule,
    BookingsModule,
    PaymentsModule,
    RatingsModule,
    RoutePricingModule,
    AdminModule,
    UploadModule,
    EmailModule,
    LookupModule,
    NotificationsModule,
    DocumentsModule,
    TrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
