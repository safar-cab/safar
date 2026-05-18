import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Security
  app.use(helmet());
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
  app.enableCors({
    origin: corsOrigin.includes(',')
      ? corsOrigin.split(',').map((o) => o.trim())
      : corsOrigin,
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Safar API')
    .setDescription(
      `Car rental booking API with three access levels:
      - **Customer APIs** (/api/customer/*) - Registration, booking, payments, ratings
      - **Driver APIs** (/api/driver/*) - Login, assigned rides, status updates, location
      - **Admin APIs** (/api/admin/*) - Dashboard, manage cars/drivers/users/bookings/payments`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Customer Auth', 'Customer registration & login')
    .addTag('Customer - Profile', 'Customer profile management')
    .addTag('Customer - Cars', 'Browse available cars')
    .addTag('Customer - Bookings', 'Create & manage bookings')
    .addTag('Customer - Payments', 'UPI payments via Razorpay')
    .addTag('Customer - Ratings', 'Rate completed rides')
    .addTag('Customer - Routes', 'Browse routes & pricing')
    .addTag('Driver Auth', 'Driver registration & login')
    .addTag('Driver - Profile', 'Driver profile management')
    .addTag('Driver - Self', 'Driver availability & location')
    .addTag('Driver - Bookings', 'View & manage assigned rides')
    .addTag('Driver - Ratings', 'Rate customers')
    .addTag('Admin Auth', 'Admin login')
    .addTag('Admin - Dashboard', 'Stats, revenue, settings')
    .addTag('Admin - Users', 'Manage all users')
    .addTag('Admin - Cars', 'Manage cars')
    .addTag('Admin - Drivers', 'Manage drivers')
    .addTag('Admin - Bookings', 'Manage all bookings')
    .addTag('Admin - Payments', 'Payment history & refunds')
    .addTag('Admin - Route Pricing', 'Manage route pricing')
    .addTag('Webhooks', 'Payment webhooks')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  logger.log(`Server running on http://localhost:${port}`);
  logger.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
