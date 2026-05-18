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
import {
  DocumentDocument,
  DocEntityType,
  DocType,
  DocStatus,
} from './schemas/document.schema';
import { StateDocument, CityDocument } from './schemas/geo.schema';
import {
  NotificationDocument,
  NotificationType,
} from './schemas/notification.schema';

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
  const documentModel = app.get<Model<DocumentDocument>>(
    getModelToken('VerificationDocument'),
  );
  const notificationModel = app.get<Model<NotificationDocument>>(
    getModelToken('Notification'),
  );
  const stateModel = app.get<Model<StateDocument>>(getModelToken('State'));
  const cityModel = app.get<Model<CityDocument>>(getModelToken('City'));

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
    documentModel.deleteMany({}),
    notificationModel.deleteMany({}),
    stateModel.deleteMany({}),
    cityModel.deleteMany({}),
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

  // ============ DOCUMENTS (30) ============
  const driverDocTypes = [
    DocType.DRIVING_LICENSE,
    DocType.AADHAAR,
    DocType.PAN,
    DocType.PHOTO,
  ];
  const carDocTypes = [
    DocType.CAR_RC,
    DocType.INSURANCE,
    DocType.PERMIT,
    DocType.FITNESS_CERTIFICATE,
    DocType.POLLUTION_CERTIFICATE,
  ];
  const docStatuses = [
    DocStatus.PENDING,
    DocStatus.VERIFIED,
    DocStatus.REJECTED,
    DocStatus.EXPIRED,
  ];
  const docs: any[] = [];

  // 18 driver documents (across first 6 drivers, 3 docs each)
  for (let i = 0; i < 6; i++) {
    const driver = driverProfiles[i];
    for (let j = 0; j < 3; j++) {
      const docIdx = i * 3 + j;
      const docType = driverDocTypes[j % driverDocTypes.length];
      const status = docStatuses[docIdx % docStatuses.length];
      docs.push({
        entityType: DocEntityType.DRIVER,
        entityId: driver._id,
        docType,
        fileUrl: `https://placehold.co/600x400?text=${docType.replace(/_/g, '+')}`,
        fileName: `${docType}_${i}.jpg`,
        status,
        documentNumber: `DOC-${String(docIdx + 1).padStart(4, '0')}`,
        expiryDate:
          status === DocStatus.EXPIRED
            ? new Date('2025-01-15')
            : new Date('2028-06-30'),
        rejectionReason:
          status === DocStatus.REJECTED ? 'Document is blurry, please re-upload' : undefined,
        verifiedAt:
          status === DocStatus.VERIFIED || status === DocStatus.REJECTED
            ? new Date()
            : undefined,
        createdAt: new Date(Date.now() - docIdx * 86400000),
      });
    }
  }

  // 12 car documents (across first 4 cars, 3 docs each)
  const allCars = await carModel.find().lean();
  for (let i = 0; i < 4; i++) {
    const car = allCars[i];
    if (!car) continue;
    for (let j = 0; j < 3; j++) {
      const docIdx = 18 + i * 3 + j;
      const docType = carDocTypes[j % carDocTypes.length];
      const status = docStatuses[docIdx % docStatuses.length];
      docs.push({
        entityType: DocEntityType.CAR,
        entityId: car._id,
        docType,
        fileUrl: `https://placehold.co/600x400?text=${docType.replace(/_/g, '+')}`,
        fileName: `${docType}_car_${i}.jpg`,
        status,
        documentNumber: `CAR-DOC-${String(docIdx + 1).padStart(4, '0')}`,
        expiryDate:
          status === DocStatus.EXPIRED
            ? new Date('2025-03-01')
            : new Date('2027-12-31'),
        rejectionReason:
          status === DocStatus.REJECTED ? 'Expired document uploaded' : undefined,
        verifiedAt:
          status === DocStatus.VERIFIED || status === DocStatus.REJECTED
            ? new Date()
            : undefined,
        createdAt: new Date(Date.now() - docIdx * 86400000),
      });
    }
  }
  await documentModel.insertMany(docs);
  logger.log(`${docs.length} documents created`);

  // ============ NOTIFICATIONS (40+) ============
  const adminUser = await userModel.findOne({ role: UserRole.ADMIN }).lean();
  const notifTemplates = [
    {
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking Confirmed',
      body: 'Your booking BK-20260515-001 is confirmed. Total: ₹2,500',
    },
    {
      type: NotificationType.DRIVER_ASSIGNED,
      title: 'Driver Assigned',
      body: 'Ramesh Yadav has been assigned to your ride BK-20260515-001',
    },
    {
      type: NotificationType.DRIVER_EN_ROUTE,
      title: 'Driver En Route',
      body: 'Your driver is on the way for ride BK-20260515-002',
    },
    {
      type: NotificationType.DRIVER_ARRIVED,
      title: 'Driver Arrived',
      body: 'Your driver has arrived at the pickup location',
    },
    {
      type: NotificationType.RIDE_STARTED,
      title: 'Ride Started',
      body: 'Your ride BK-20260514-003 has started. Have a safe journey!',
    },
    {
      type: NotificationType.RIDE_COMPLETED,
      title: 'Ride Completed',
      body: 'Your ride is complete. Total: ₹3,150. Thank you for choosing Safar!',
    },
    {
      type: NotificationType.BOOKING_CANCELLED,
      title: 'Booking Cancelled',
      body: 'Booking BK-20260513-005 cancelled. Refund: ₹1,800 will be processed.',
    },
    {
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      body: 'Payment of ₹2,500 received for BK-20260515-001',
    },
    {
      type: NotificationType.GENERAL,
      title: 'Document Verified',
      body: 'Your driving license has been verified successfully',
    },
    {
      type: NotificationType.GENERAL,
      title: 'Document Expiring Soon',
      body: 'Your Aadhaar card expires in 7 days. Please renew it.',
    },
  ];

  const notifications: any[] = [];
  // Customer notifications (15)
  for (let i = 0; i < 15; i++) {
    const tmpl = notifTemplates[i % notifTemplates.length];
    const customer = customers[i % customers.length];
    notifications.push({
      user: customer._id,
      title: tmpl.title,
      body: tmpl.body,
      type: tmpl.type,
      read: i < 5,
      readAt: i < 5 ? new Date() : undefined,
      data: { bookingId: bookings[i % bookings.length]?._id?.toString(), url: '/customer/bookings' },
      createdAt: new Date(Date.now() - i * 3600000),
    });
  }
  // Driver notifications (15)
  for (let i = 0; i < 15; i++) {
    const driverUser = allDriverUsers[i % allDriverUsers.length];
    const driverTemplates = [
      { type: NotificationType.DRIVER_ASSIGNED, title: 'New Ride Assigned', body: `You have been assigned ride BK-2026051${i}-00${i + 1}` },
      { type: NotificationType.GENERAL, title: 'Document Verified', body: 'Your driving license has been verified' },
      { type: NotificationType.BOOKING_CANCELLED, title: 'Ride Cancelled', body: `Ride BK-2026051${i}-00${i + 1} has been cancelled by the customer` },
      { type: NotificationType.GENERAL, title: 'Rating Received', body: `You received a 5-star rating for your recent ride` },
      { type: NotificationType.GENERAL, title: 'Document Expiring', body: 'Your permit expires in 14 days' },
    ];
    const tmpl = driverTemplates[i % driverTemplates.length];
    notifications.push({
      user: driverUser._id,
      title: tmpl.title,
      body: tmpl.body,
      type: tmpl.type,
      read: i < 3,
      readAt: i < 3 ? new Date() : undefined,
      data: { url: '/driver/rides' },
      createdAt: new Date(Date.now() - i * 7200000),
    });
  }
  // Admin notifications (10)
  if (adminUser) {
    const adminTemplates = [
      { title: 'New Booking', body: 'New booking BK-20260518-001 created by Rahul Sharma' },
      { title: 'Payment Received', body: 'Payment of ₹4,200 received for BK-20260517-003' },
      { title: 'Document Pending', body: '5 documents are awaiting verification' },
      { title: 'Driver Registered', body: 'New driver Santosh Chouhan registered and needs verification' },
      { title: 'Ride Completed', body: 'Ride BK-20260516-002 completed successfully' },
      { title: 'Cancellation', body: 'Booking BK-20260515-004 cancelled by customer' },
      { title: 'Document Expired', body: '2 driver documents have expired today' },
      { title: 'Revenue Alert', body: "Today's revenue: ₹12,500 from 5 rides" },
      { title: 'Low Availability', body: 'Only 2 cars available for tomorrow' },
      { title: 'Rating Alert', body: 'Driver Gopal Jat received a 1-star rating' },
    ];
    for (let i = 0; i < 10; i++) {
      notifications.push({
        user: adminUser._id,
        title: adminTemplates[i].title,
        body: adminTemplates[i].body,
        type: NotificationType.GENERAL,
        read: i < 2,
        readAt: i < 2 ? new Date() : undefined,
        data: { url: '/admin' },
        createdAt: new Date(Date.now() - i * 5400000),
      });
    }
  }
  await notificationModel.insertMany(notifications);
  logger.log(`${notifications.length} notifications created`);

  // ============ STATES & CITIES ============
  const statesData = [
    {
      name: 'Madhya Pradesh',
      code: 'MP',
      cities: ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Ratlam', 'Jabalpur', 'Gwalior'],
    },
    {
      name: 'Rajasthan',
      code: 'RJ',
      cities: ['Jaipur', 'Udaipur', 'Jodhpur', 'Kota', 'Ajmer', 'Chittorgarh'],
    },
    {
      name: 'Gujarat',
      code: 'GJ',
      cities: ['Ahmedabad', 'Vadodara', 'Surat', 'Rajkot', 'Gandhinagar'],
    },
    {
      name: 'Maharashtra',
      code: 'MH',
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
    },
    {
      name: 'Uttar Pradesh',
      code: 'UP',
      isActive: false,
      cities: ['Lucknow', 'Agra', 'Varanasi', 'Kanpur'],
    },
  ];

  for (const sd of statesData) {
    const state = await stateModel.create({
      name: sd.name,
      code: sd.code,
      isActive: sd.isActive !== false,
    });
    const cityDocs = sd.cities.map((name) => ({
      name,
      state: state._id,
      isActive: sd.isActive !== false,
    }));
    await cityModel.insertMany(cityDocs);
  }
  const totalStates = await stateModel.countDocuments();
  const totalCities = await cityModel.countDocuments();
  logger.log(`${totalStates} states, ${totalCities} cities created`);

  // ============ SUMMARY ============
  const counts = await Promise.all([
    userModel.countDocuments(),
    driverModel.countDocuments(),
    carModel.countDocuments(),
    bookingModel.countDocuments(),
    paymentModel.countDocuments(),
    ratingModel.countDocuments(),
    routeModel.countDocuments(),
    documentModel.countDocuments(),
    notificationModel.countDocuments(),
    stateModel.countDocuments(),
    cityModel.countDocuments(),
  ]);
  logger.log('');
  logger.log('=== SEED SUMMARY ===');
  logger.log(`Users:         ${counts[0]}`);
  logger.log(`Drivers:       ${counts[1]}`);
  logger.log(`Cars:          ${counts[2]}`);
  logger.log(`Bookings:      ${counts[3]}`);
  logger.log(`Payments:      ${counts[4]}`);
  logger.log(`Ratings:       ${counts[5]}`);
  logger.log(`Routes:        ${counts[6]}`);
  logger.log(`Documents:     ${counts[7]}`);
  logger.log(`Notifications: ${counts[8]}`);
  logger.log(`States:        ${counts[9]}`);
  logger.log(`Cities:        ${counts[10]}`);
  logger.log('');
  logger.log('Login credentials:');
  logger.log('  Admin:    9999999999 / Admin@123');
  logger.log('  Driver:   9876543210 / Driver@123');
  logger.log('  Customer: 8765432109 / Customer@123');

  await app.close();
  logger.log('Seeding complete!');
}

seed().catch(console.error);
