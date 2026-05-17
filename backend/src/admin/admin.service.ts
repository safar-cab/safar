import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../schemas/payment.schema';
import { Car, CarDocument } from '../schemas/car.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import {
  CompanySettings,
  CompanySettingsDocument,
} from '../schemas/company-settings.schema';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(CompanySettings.name)
    private settingsModel: Model<CompanySettingsDocument>,
  ) {}

  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalDrivers,
      totalCars,
      totalBookings,
      todayBookings,
      activeBookings,
      completedBookings,
      totalRevenue,
      todayRevenue,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'customer' as any }),
      this.driverModel.countDocuments(),
      this.carModel.countDocuments({ isActive: true }),
      this.bookingModel.countDocuments(),
      this.bookingModel.countDocuments({ createdAt: { $gte: today } }),
      this.bookingModel.countDocuments({
        status: {
          $in: [
            BookingStatus.CONFIRMED,
            BookingStatus.DRIVER_ASSIGNED,
            BookingStatus.IN_PROGRESS,
          ],
        },
      }),
      this.bookingModel.countDocuments({ status: BookingStatus.COMPLETED }),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.CAPTURED } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        { $match: { status: PaymentStatus.CAPTURED, paidAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    return {
      totalUsers,
      totalDrivers,
      totalCars,
      totalBookings,
      todayBookings,
      activeBookings,
      completedBookings,
      totalRevenue: totalRevenue[0]?.total || 0,
      todayRevenue: todayRevenue[0]?.total || 0,
    };
  }

  async getRevenueChart(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.paymentModel.aggregate([
      {
        $match: { status: PaymentStatus.CAPTURED, paidAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  }

  async getBookingStats(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.bookingModel.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);
  }

  async getSettings() {
    let settings = await this.settingsModel.findOne().lean();
    if (!settings) {
      settings = await this.settingsModel.create({
        companyName: 'Safar',
        defaultPricePerKm: 12,
      });
    }
    return settings;
  }

  async updateSettings(dto: Partial<CompanySettings>) {
    let settings = await this.settingsModel.findOne();
    if (!settings) {
      settings = await this.settingsModel.create({
        companyName: 'Safar',
        ...dto,
      });
    } else {
      Object.assign(settings, dto);
      await settings.save();
    }
    this.logger.log('Company settings updated');
    return settings;
  }
}
