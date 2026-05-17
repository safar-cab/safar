import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module';
import { UserDocument, UserRole } from './schemas/user.schema';
import { CarDocument, CarCategory } from './schemas/car.schema';
import { DriverDocument } from './schemas/driver.schema';
import { BookingDocument, BookingStatus } from './schemas/booking.schema';
import { PaymentDocument, PaymentStatus } from './schemas/payment.schema';
import { RatingDocument } from './schemas/rating.schema';
import { RoutePricingDocument } from './schemas/route-pricing.schema';
import { CompanySettingsDocument } from './schemas/company-settings.schema';

async function seed() {
  const logger = new Logger('Seeder');
  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken('User'));
  const carModel = app.get<Model<CarDocument>>(getModelToken('Car'));
  const driverModel = app.get<Model<DriverDocument>>(getModelToken('Driver'));
  const bookingModel = app.get<Model<BookingDocument>>(
    getModelToken('Booking'),
  );
  const paymentModel = app.get<Model<PaymentDocument>>(
    getModelToken('Payment'),
  );
  const ratingModel = app.get<Model<RatingDocument>>(getModelToken('Rating'));
  const routeModel = app.get<Model<RoutePricingDocument>>(
    getModelToken('RoutePricing'),
  );
  const settingsModel = app.get<Model<CompanySettingsDocument>>(
    getModelToken('CompanySettings'),
  );

  // Clear existing data
  await Promise.all([
    userModel.deleteMany({}),
    carModel.deleteMany({}),
    driverModel.deleteMany({}),
    bookingModel.deleteMany({}),
    paymentModel.deleteMany({}),
    ratingModel.deleteMany({}),
    routeModel.deleteMany({}),
    settingsModel.deleteMany({}),
  ]);
  logger.log('Cleared all collections');

  const hash = await bcrypt.hash('Admin@123', 10);
  const driverHash = await bcrypt.hash('Driver@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);
  const testHash = await bcrypt.hash('Test@123', 10);

  // ============ USERS (35+) ============
  await userModel.create({
    name: 'Admin Safar',
    phone: '9999999999',
    email: 'admin@safar.in',
    passwordHash: hash,
    role: UserRole.ADMIN,
    isActive: true,
  });

  const customerNames = [
    'Rahul Sharma',
    'Priya Patel',
    'Amit Kumar',
    'Sneha Gupta',
    'Vikas Singh',
    'Neha Joshi',
    'Rohan Verma',
    'Anita Desai',
    'Karan Malhotra',
    'Pooja Agarwal',
    'Deepak Tiwari',
    'Swati Mishra',
    'Arjun Reddy',
    'Megha Saxena',
    'Nikhil Jain',
    'Ritu Chauhan',
    'Sanjay Dubey',
    'Kavita Rawat',
    'Manish Pandey',
    'Divya Nair',
  ];
  const customers = await userModel.insertMany(
    customerNames.map((name, i) => ({
      name,
      phone: `70000${String(i + 10).padStart(5, '0')}`,
      email: `${name.split(' ')[0].toLowerCase()}${i}@safar.in`,
      passwordHash: i === 0 ? customerHash : testHash,
      role: UserRole.CUSTOMER,
      isActive: true,
      isBlocked: i === 19,
      blockReason: i === 19 ? 'Suspicious activity' : undefined,
    })),
  );
  // Seed customer with known creds
  await userModel.findOneAndUpdate(
    { phone: '8765432109' },
    {
      name: 'Suresh Customer',
      phone: '8765432109',
      email: 'customer@safar.in',
      passwordHash: customerHash,
      role: UserRole.CUSTOMER,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log(`${customers.length + 1} customers created`);

  const driverNames = [
    'Ramesh Yadav',
    'Sunil Malviya',
    'Deepak Prajapati',
    'Rajesh Sahu',
    'Mohan Verma',
    'Kamlesh Sharma',
    'Gopal Jat',
    'Anil Kushwaha',
    'Bhupendra Thakur',
    'Vinod Patidar',
    'Santosh Chouhan',
    'Dinesh Parmar',
  ];
  const driverUsers = await userModel.insertMany(
    driverNames.map((name, i) => ({
      name,
      phone: `98765${String(i + 10).padStart(5, '0')}`,
      email: `${name.split(' ')[0].toLowerCase()}${i}@driver.safar.in`,
      passwordHash: i === 0 ? driverHash : testHash,
      role: UserRole.DRIVER,
      isActive: true,
    })),
  );
  // Keep original seed driver
  const seedDriver = await userModel.findOneAndUpdate(
    { phone: '9876543210' },
    {
      name: 'Ramesh Driver',
      phone: '9876543210',
      email: 'driver@safar.in',
      passwordHash: driverHash,
      role: UserRole.DRIVER,
      isActive: true,
    },
    { upsert: true, new: true },
  );
  logger.log(`${driverUsers.length + 1} drivers created`);

  // ============ DRIVER PROFILES (12+) ============
  const allDriverUsers = [seedDriver, ...driverUsers];
  const driverProfiles = await driverModel.insertMany(
    allDriverUsers.map((u, i) => ({
      userId: u._id,
      licenseNumber: `MP09DL${String(i + 100).padStart(4, '0')}`,
      licenseExpiry: new Date('2028-12-31'),
      isVerified: i < 10, // first 10 verified
      isAvailable: i < 8, // first 8 available
      avgRating: 3.5 + Math.random() * 1.5,
      totalRides: Math.floor(Math.random() * 200),
      currentLocation: {
        type: 'Point',
        coordinates: [
          75.8577 + Math.random() * 0.1,
          22.7196 + Math.random() * 0.1,
        ],
      },
    })),
  );
  logger.log(`${driverProfiles.length} driver profiles created`);

  // ============ CARS (30+) ============
  const carData = [
    {
      make: 'Maruti',
      model: 'Swift Dzire',
      cat: CarCategory.SEDAN,
      seats: 4,
      colors: ['White', 'Silver', 'Black'],
    },
    {
      make: 'Hyundai',
      model: 'Verna',
      cat: CarCategory.SEDAN,
      seats: 4,
      colors: ['Black', 'Red', 'Blue'],
    },
    {
      make: 'Honda',
      model: 'City',
      cat: CarCategory.SEDAN,
      seats: 4,
      colors: ['White', 'Grey'],
    },
    {
      make: 'Toyota',
      model: 'Innova Crysta',
      cat: CarCategory.SUV,
      seats: 7,
      colors: ['White', 'Silver'],
    },
    {
      make: 'Maruti',
      model: 'Ertiga',
      cat: CarCategory.SUV,
      seats: 7,
      colors: ['Silver', 'Brown'],
    },
    {
      make: 'Hyundai',
      model: 'Creta',
      cat: CarCategory.SUV,
      seats: 5,
      colors: ['Grey', 'White', 'Blue'],
    },
    {
      make: 'Tata',
      model: 'Nexon',
      cat: CarCategory.HATCHBACK,
      seats: 5,
      colors: ['Red', 'Blue', 'White'],
    },
    {
      make: 'Maruti',
      model: 'Swift',
      cat: CarCategory.HATCHBACK,
      seats: 4,
      colors: ['Red', 'Orange', 'White'],
    },
    {
      make: 'Toyota',
      model: 'Fortuner',
      cat: CarCategory.SUV,
      seats: 7,
      colors: ['White', 'Black'],
    },
    {
      make: 'Kia',
      model: 'Seltos',
      cat: CarCategory.SUV,
      seats: 5,
      colors: ['White', 'Red'],
    },
    {
      make: 'Tata',
      model: 'Winger',
      cat: CarCategory.TEMPO_TRAVELLER,
      seats: 12,
      colors: ['White'],
    },
    {
      make: 'Force',
      model: 'Traveller',
      cat: CarCategory.TEMPO_TRAVELLER,
      seats: 17,
      colors: ['White', 'Silver'],
    },
    {
      make: 'Mercedes',
      model: 'E-Class',
      cat: CarCategory.LUXURY,
      seats: 4,
      colors: ['Black', 'White'],
    },
  ];
  const cars: CarDocument[] = [];
  let carIdx = 0;
  for (const cd of carData) {
    for (const color of cd.colors) {
      carIdx++;
      const car = await carModel.create({
        registrationNumber: `MP09${String.fromCharCode(65 + Math.floor(carIdx / 26))}${String.fromCharCode(65 + (carIdx % 26))}${String(1000 + carIdx)}`,
        make: cd.make,
        model: cd.model as any,
        year: 2022 + (carIdx % 3),
        color,
        category: cd.cat,
        seats: cd.seats,
        isActive: carIdx <= 28, // 2 inactive
        assignedDriver:
          carIdx <= driverProfiles.length
            ? driverProfiles[carIdx - 1]?._id
            : undefined,
      });
      cars.push(car);
    }
  }
  logger.log(`${cars.length} cars created`);

  // ============ ROUTES (15+) ============
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
    {
      name: 'Indore to Mhow',
      distanceKm: 22,
      pricePerKm: 16,
      baseFare: 200,
      tollEstimate: 0,
    },
    {
      name: 'Indore to Pithampur',
      distanceKm: 30,
      pricePerKm: 15,
      baseFare: 200,
      tollEstimate: 0,
    },
    {
      name: 'Indore to Dhar',
      distanceKm: 60,
      pricePerKm: 13,
      baseFare: 300,
      tollEstimate: 50,
    },
    {
      name: 'Indore to Ratlam',
      distanceKm: 130,
      pricePerKm: 12,
      baseFare: 400,
      tollEstimate: 150,
    },
    {
      name: 'Indore to Khandwa',
      distanceKm: 140,
      pricePerKm: 12,
      baseFare: 450,
      tollEstimate: 100,
    },
    {
      name: 'Indore to Burhanpur',
      distanceKm: 175,
      pricePerKm: 11,
      baseFare: 500,
      tollEstimate: 200,
    },
    {
      name: 'Indore to Jabalpur',
      distanceKm: 340,
      pricePerKm: 11,
      baseFare: 800,
      tollEstimate: 400,
    },
    {
      name: 'Indore to Nagpur',
      distanceKm: 520,
      pricePerKm: 10,
      baseFare: 1000,
      tollEstimate: 600,
    },
    {
      name: 'Indore to Mumbai',
      distanceKm: 585,
      pricePerKm: 10,
      baseFare: 1200,
      tollEstimate: 800,
    },
    {
      name: 'Indore to Ahmedabad',
      distanceKm: 400,
      pricePerKm: 11,
      baseFare: 900,
      tollEstimate: 500,
    },
  ];
  await routeModel.insertMany(routes.map((r) => ({ ...r, isActive: true })));
  logger.log(`${routes.length} routes created`);

  // ============ BOOKINGS (35+) ============
  const pickups = [
    'Vijay Nagar, Indore',
    'Palasia Square, Indore',
    'Rajwada, Indore',
    'Sapna Sangeeta, Indore',
    'MR 10, Indore',
    'AB Road, Indore',
    'Bhawarkuan, Indore',
    'Geeta Bhawan, Indore',
    'Scheme 78, Indore',
    'LIG Colony, Indore',
  ];
  const drops = [
    'Bhopal Railway Station',
    'Ujjain Mahakal Temple',
    'Dewas Bus Stand',
    'Omkareshwar Temple',
    'Indore Airport',
    'Mhow Cantonment',
    'Pithampur AKVN',
    'Dhar Fort',
    'Ratlam Junction',
    'Khandwa Station',
  ];
  const distances = [195, 55, 35, 85, 10, 22, 30, 60, 130, 140];
  const statuses = [
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.COMPLETED,
    BookingStatus.IN_PROGRESS,
    BookingStatus.IN_PROGRESS,
    BookingStatus.DRIVER_EN_ROUTE,
    BookingStatus.DRIVER_EN_ROUTE,
    BookingStatus.PICKED_UP,
    BookingStatus.DRIVER_ASSIGNED,
    BookingStatus.DRIVER_ASSIGNED,
    BookingStatus.DRIVER_ASSIGNED,
    BookingStatus.CONFIRMED,
    BookingStatus.CONFIRMED,
    BookingStatus.PENDING,
    BookingStatus.PENDING,
    BookingStatus.PENDING,
    BookingStatus.CANCELLED,
    BookingStatus.CANCELLED,
  ];

  const bookings: BookingDocument[] = [];
  for (let i = 0; i < 35; i++) {
    const custIdx = i % customers.length;
    const carIdx2 = i % cars.length;
    const routeIdx = i % pickups.length;
    const distKm = distances[routeIdx];
    const pricePerKm = 12;
    const baseFare = 300 + routeIdx * 50;
    const distanceCharge = distKm * pricePerKm;
    const tollEstimate =
      routeIdx % 3 === 0 ? 200 : routeIdx % 3 === 1 ? 100 : 0;
    const totalAmount = baseFare + distanceCharge + tollEstimate;
    const gstAmount = Math.round(totalAmount * 0.05);

    const daysAgo = 30 - i;
    const bookingDate = new Date();
    bookingDate.setDate(bookingDate.getDate() - daysAgo);

    const booking = await bookingModel.create({
      bookingId: `BK-${bookingDate.toISOString().slice(0, 10).replace(/-/g, '')}-${String(i + 1).padStart(3, '0')}`,
      user: customers[custIdx]._id,
      car: cars[carIdx2]._id,
      driver:
        i < 28 && driverProfiles[i % driverProfiles.length]
          ? driverProfiles[i % driverProfiles.length]._id
          : undefined,
      pickup: { address: pickups[routeIdx], landmark: `Landmark ${i + 1}` },
      drop: { address: drops[routeIdx] },
      schedule: { startDate: bookingDate, startTime: `${8 + (i % 12)}:00` },
      distance: {
        estimated: distKm,
        actual:
          statuses[i] === BookingStatus.COMPLETED
            ? distKm + Math.floor(Math.random() * 10)
            : 0,
      },
      pricing: {
        pricePerKm,
        baseFare,
        distanceCharge,
        tollEstimate,
        totalAmount: totalAmount + gstAmount,
        gstAmount,
      },
      status: statuses[i],
      cancellation:
        statuses[i] === BookingStatus.CANCELLED
          ? {
              cancelledBy: 'customer',
              reason: 'Change of plans',
              cancelledAt: bookingDate,
              refundPolicy: 'full',
              refundPercentage: 100,
              refundAmount: totalAmount + gstAmount,
            }
          : undefined,
      actualTimes:
        statuses[i] === BookingStatus.COMPLETED
          ? {
              driverStarted: bookingDate,
              pickedUp: bookingDate,
              completed: bookingDate,
            }
          : undefined,
    });
    bookings.push(booking);
  }
  logger.log(`${bookings.length} bookings created`);

  // ============ PAYMENTS (30+) ============
  const payments: any[] = [];
  for (let i = 0; i < 30; i++) {
    const bk = bookings[i];
    const isPaid = [
      BookingStatus.COMPLETED,
      BookingStatus.IN_PROGRESS,
      BookingStatus.PICKED_UP,
      BookingStatus.DRIVER_EN_ROUTE,
      BookingStatus.DRIVER_ASSIGNED,
      BookingStatus.CONFIRMED,
    ].includes(bk.status);
    payments.push({
      booking: bk._id,
      user: bk.user,
      razorpay: {
        orderId: `order_${String(i + 1).padStart(6, '0')}`,
        paymentId: isPaid ? `pay_${String(i + 1).padStart(6, '0')}` : undefined,
      },
      amount: bk.pricing.totalAmount * 100, // paise
      currency: 'INR',
      method: 'upi',
      upiId: `user${i}@upi`,
      status: isPaid
        ? PaymentStatus.CAPTURED
        : bk.status === BookingStatus.CANCELLED
          ? PaymentStatus.REFUNDED
          : PaymentStatus.CREATED,
      paidAt: isPaid ? new Date() : undefined,
      refund:
        bk.status === BookingStatus.CANCELLED
          ? {
              refundId: `rfnd_${String(i + 1).padStart(6, '0')}`,
              amount: bk.pricing.totalAmount * 100,
              status: 'processed',
              processedAt: new Date(),
            }
          : undefined,
    });
  }
  await paymentModel.insertMany(payments as any);
  logger.log(`${payments.length} payments created`);

  // ============ RATINGS (30+) ============
  const reviews = [
    'Great ride, very smooth!',
    'On time pickup, professional driver',
    'Good car condition',
    'Excellent service, highly recommend',
    'Comfortable journey',
    'Driver was polite and careful',
    'Clean car, nice experience',
    'Will book again',
    'Best cab service in Indore',
    'Very satisfied with the ride',
    'Driver knew the route well',
    'Comfortable seats, good AC',
    'Punctual and professional',
    'Smooth highway drive',
    'Great value for money',
  ];
  const ratings: any[] = [];
  for (let i = 0; i < 30; i++) {
    if (bookings[i].status !== BookingStatus.COMPLETED) continue;
    const driverUserId = allDriverUsers[i % allDriverUsers.length]?._id;
    if (!driverUserId) continue;
    ratings.push({
      booking: bookings[i]._id,
      fromUser: bookings[i].user,
      toUser: driverUserId,
      raterRole: 'customer',
      rating: 3 + Math.floor(Math.random() * 3), // 3-5
      review: reviews[i % reviews.length],
    });
  }
  await ratingModel.insertMany(ratings as any);
  logger.log(`${ratings.length} ratings created`);

  // ============ COMPANY SETTINGS ============
  await settingsModel.create({
    companyName: 'Safar',
    phone: '9999999999',
    email: 'info@safar.in',
    defaultPricePerKm: 12,
  });
  logger.log('Company settings created');

  // ============ SUMMARY ============
  const counts = await Promise.all([
    userModel.countDocuments(),
    driverModel.countDocuments(),
    carModel.countDocuments(),
    bookingModel.countDocuments(),
    paymentModel.countDocuments(),
    ratingModel.countDocuments(),
    routeModel.countDocuments(),
  ]);
  logger.log('');
  logger.log('=== SEED SUMMARY ===');
  logger.log(`Users:    ${counts[0]}`);
  logger.log(`Drivers:  ${counts[1]}`);
  logger.log(`Cars:     ${counts[2]}`);
  logger.log(`Bookings: ${counts[3]}`);
  logger.log(`Payments: ${counts[4]}`);
  logger.log(`Ratings:  ${counts[5]}`);
  logger.log(`Routes:   ${counts[6]}`);
  logger.log('');
  logger.log('Login credentials:');
  logger.log('  Admin:    9999999999 / Admin@123');
  logger.log('  Driver:   9876543210 / Driver@123');
  logger.log('  Customer: 8765432109 / Customer@123');

  await app.close();
  logger.log('Seeding complete!');
}

seed().catch(console.error);
