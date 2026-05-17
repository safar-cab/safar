import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { UserDocument, UserRole } from './schemas/user.schema';
import { CarDocument, CarCategory } from './schemas/car.schema';
import { RoutePricingDocument } from './schemas/route-pricing.schema';
import { CompanySettingsDocument } from './schemas/company-settings.schema';

async function seed() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
  const carModel = app.get<Model<CarDocument>>(getModelToken('Car'));
  const routeModel = app.get<Model<RoutePricingDocument>>(
    getModelToken('RoutePricing'),
  );
  const settingsModel = app.get<Model<CompanySettingsDocument>>(
    getModelToken('CompanySettings'),
  );

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  // Admin user
  const admin = await userModel.findOneAndUpdate(
    { phone: '9999999999' },
    {
      name: 'Admin',
      phone: '9999999999',
      email: 'admin@books.in',
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log(`Admin user: phone=9999999999 password=Admin@123`);

  // Sample driver user
  await userModel.findOneAndUpdate(
    { phone: '9876543210' },
    {
      name: 'Ramesh Driver',
      phone: '9876543210',
      email: 'driver@books.in',
      passwordHash: await bcrypt.hash('Driver@123', 10),
      role: UserRole.DRIVER,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log(`Driver user: phone=9876543210 password=Driver@123`);

  // Sample customer user
  await userModel.findOneAndUpdate(
    { phone: '8765432109' },
    {
      name: 'Suresh Customer',
      phone: '8765432109',
      email: 'customer@books.in',
      passwordHash: await bcrypt.hash('Customer@123', 10),
      role: UserRole.CUSTOMER,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log(`Customer user: phone=8765432109 password=Customer@123`);

  // Sample car
  await carModel.findOneAndUpdate(
    { registrationNumber: 'MP09AB1234' },
    {
      registrationNumber: 'MP09AB1234',
      make: 'Maruti',
      model: 'Swift Dzire',
      year: 2023,
      color: 'White',
      category: CarCategory.SEDAN,
      seats: 4,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log('Sample car created: MP09AB1234');

  // Sample routes
  const routes = [
    {
      name: 'Indore to Bhopal',
      distanceKm: 195,
      pricePerKm: 12,
      baseFare: 500,
      tollEstimate: 200,
    },
    {
      name: 'Indore to Ujjain',
      distanceKm: 55,
      pricePerKm: 14,
      baseFare: 300,
      tollEstimate: 0,
    },
    {
      name: 'Indore to Dewas',
      distanceKm: 35,
      pricePerKm: 15,
      baseFare: 200,
      tollEstimate: 0,
    },
    {
      name: 'Indore to Omkareshwar',
      distanceKm: 85,
      pricePerKm: 13,
      baseFare: 400,
      tollEstimate: 100,
    },
    {
      name: 'Indore to Airport',
      distanceKm: 10,
      pricePerKm: 20,
      baseFare: 200,
      tollEstimate: 0,
    },
  ];

  for (const route of routes) {
    await routeModel.findOneAndUpdate(
      { name: route.name },
      { ...route, isActive: true },
      { upsert: true },
    );
  }
  logger.log(`${routes.length} routes seeded`);

  // Company settings
  await settingsModel.findOneAndUpdate(
    {},
    {
      companyName: 'Safar',
      phone: '9999999999',
      email: 'info@books.in',
      defaultPricePerKm: 12,
    },
    { upsert: true },
  );
  logger.log('Company settings seeded');

  await app.close();
  logger.log('Seeding complete!');
}

seed().catch(console.error);
