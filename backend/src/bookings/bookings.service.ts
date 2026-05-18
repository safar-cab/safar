import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserDocument } from '../schemas/user.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import {
  CompanySettings,
  CompanySettingsDocument,
} from '../schemas/company-settings.schema';
import {
  RoutePricing,
  RoutePricingDocument,
} from '../schemas/route-pricing.schema';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(CompanySettings.name)
    private settingsModel: Model<CompanySettingsDocument>,
    @InjectModel(RoutePricing.name)
    private routeModel: Model<RoutePricingDocument>,
    private notificationsService: NotificationsService,
  ) {}

  private async getSettings() {
    const settings = await this.settingsModel.findOne().lean();
    return {
      pricePerKm: settings?.defaultPricePerKm || 12,
      baseFare: 500,
      stopWaitingChargePerInterval: settings?.stopWaitingChargePerInterval || 10,
      stopWaitingIntervalMinutes: settings?.stopWaitingIntervalMinutes || 15,
    };
  }

  async getPricingConfig() {
    return this.getSettings();
  }

  /**
   * Try to match a route by pickup+drop addresses → use route-specific pricing.
   * Falls back to global config if no route matches.
   */
  private async findMatchingRoute(
    pickupAddress: string,
    dropAddress: string,
  ) {
    if (!pickupAddress || !dropAddress) return null;

    // Try to match by city name in fromCity.name / toCity.name
    const pickup = pickupAddress.split(',')[0].trim().toLowerCase();
    const drop = dropAddress.split(',')[0].trim().toLowerCase();

    const route = await this.routeModel.findOne({
      isActive: true,
      $or: [
        {
          'fromCity.name': { $regex: new RegExp(`^${pickup}$`, 'i') },
          'toCity.name': { $regex: new RegExp(`^${drop}$`, 'i') },
        },
        {
          'fromCity.name': { $regex: new RegExp(`^${drop}$`, 'i') },
          'toCity.name': { $regex: new RegExp(`^${pickup}$`, 'i') },
        },
      ],
    }).lean();

    return route;
  }

  async calculatePricing(data: {
    pickupAddress: string;
    dropAddress: string;
    estimatedDistanceKm?: number;
    tollEstimate?: number;
    stopCount?: number;
  }) {
    const config = await this.getSettings();
    const route = await this.findMatchingRoute(
      data.pickupAddress,
      data.dropAddress,
    );

    // Use route-specific pricing if found, else global config
    const pricePerKm = route?.pricePerKm || config.pricePerKm;
    const baseFare = route?.baseFare || config.baseFare;
    const distanceKm =
      data.estimatedDistanceKm || route?.distanceKm || 100;
    const tollEstimate =
      data.tollEstimate ?? route?.tollEstimate ?? 0;

    const distanceCharge = Math.round(distanceKm * pricePerKm * 10) / 10;
    const stopChargePerStop = config.stopWaitingChargePerInterval;
    const stopCount = data.stopCount || 0;
    const totalStopCharge = stopCount * stopChargePerStop;
    const taxableAmount = baseFare + distanceCharge + totalStopCharge;
    const cgst = Math.round(taxableAmount * 0.025);
    const sgst = Math.round(taxableAmount * 0.025);
    const gstAmount = cgst + sgst;
    const totalAmount = taxableAmount + tollEstimate + gstAmount;

    return {
      pricePerKm,
      baseFare,
      distanceKm,
      distanceCharge,
      tollEstimate,
      stopChargePerStop,
      stopCount,
      totalStopCharge,
      cgst,
      sgst,
      gstAmount,
      totalAmount,
      routeMatched: !!route,
      routeName: route?.name,
    };
  }

  private async generateBookingId(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.bookingModel.countDocuments({
      createdAt: { $gte: new Date(today.toISOString().slice(0, 10)) },
    });
    return `BK-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  async create(userId: string, dto: CreateBookingDto) {
    const bookingId = await this.generateBookingId();

    // Calculate pricing — uses route-specific pricing if route matches
    const pricing = await this.calculatePricing({
      pickupAddress: dto.pickup.address,
      dropAddress: dto.drop.address,
      estimatedDistanceKm: dto.estimatedDistanceKm,
      tollEstimate: dto.tollEstimate,
      stopCount: dto.stops?.length || 0,
    });
    const {
      pricePerKm,
      baseFare,
      distanceCharge,
      tollEstimate,
      stopChargePerStop,
      stopCount,
      totalStopCharge,
      cgst,
      sgst,
      gstAmount,
      totalAmount,
    } = pricing;
    const distanceKm = pricing.distanceKm;

    const booking = await this.bookingModel.create({
      bookingId,
      user: userId,
      car: dto.carId,
      pickup: {
        address: dto.pickup.address,
        coordinates: dto.pickup.coordinates
          ? { type: 'Point', coordinates: dto.pickup.coordinates }
          : undefined,
        landmark: dto.pickup.landmark,
      },
      drop: {
        address: dto.drop.address,
        coordinates: dto.drop.coordinates
          ? { type: 'Point', coordinates: dto.drop.coordinates }
          : undefined,
        landmark: dto.drop.landmark,
      },
      stops:
        dto.stops?.map((s) => ({
          order: s.order,
          address: s.address,
          coordinates: s.coordinates
            ? { type: 'Point', coordinates: s.coordinates }
            : undefined,
          status: 'pending' as const,
        })) || [],
      schedule: {
        startDate: new Date(dto.schedule.startDate),
        startTime: dto.schedule.startTime,
        endDate: dto.schedule.endDate
          ? new Date(dto.schedule.endDate)
          : undefined,
        endTime: dto.schedule.endTime,
      },
      distance: { estimated: distanceKm, actual: 0 },
      pricing: {
        pricePerKm,
        baseFare,
        distanceCharge,
        tollEstimate,
        stopChargePerStop,
        stopCount,
        totalStopCharge,
        cgst,
        sgst,
        gstAmount,
        totalAmount,
      },
      status: BookingStatus.PENDING,
    });

    this.logger.log(`Booking created: ${bookingId} by user ${userId}`);
    return booking;
  }

  async findByUser(
    userId: string,
    query: { page?: number; limit?: number; status?: string },
  ) {
    const { page = 1, limit = 10, status } = query;
    const filter: any = { user: userId };
    if (status) {
      filter.status = status.includes(',') ? { $in: status.split(',') } : status;
    }

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('car')
        .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone email' } })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.bookingModel.countDocuments(filter),
    ]);

    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('car')
      .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone email' } })
      .populate('user', 'name phone email')
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByBookingId(bookingId: string) {
    const booking = await this.bookingModel
      .findOne({ bookingId })
      .populate('car')
      .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone email' } })
      .populate('user', 'name phone email')
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async cancel(id: string, cancelledBy: string, reason: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');

    if (
      [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.REFUNDED,
      ].includes(booking.status)
    ) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancellation = {
      cancelledBy,
      reason,
      cancelledAt: new Date(),
      refundPolicy: 'full',
      refundPercentage: 100,
      refundAmount: booking.pricing.totalAmount,
    };
    await booking.save();

    this.logger.log(`Booking ${booking.bookingId} cancelled by ${cancelledBy}`);

    // Notify customer + driver
    const user = await this.userModel
      .findById(booking.user)
      .select('phone')
      .lean();
    let driverUserId: string | undefined;
    if (booking.driver) {
      const driver = await this.driverModel
        .findById(booking.driver)
        .select('userId')
        .lean();
      driverUserId = driver?.userId?.toString();
    }
    this.notificationsService.onBookingCancelled(
      booking.user.toString(),
      booking.bookingId,
      booking.pricing.totalAmount,
      user?.phone,
      driverUserId,
    );

    return booking;
  }

  // Admin methods
  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (search) filter.bookingId = { $regex: search, $options: 'i' };
    if (dateFrom || dateTo) {
      const createdAtFilter: Record<string, Date> = {};
      if (dateFrom) createdAtFilter.$gte = new Date(dateFrom);
      if (dateTo) createdAtFilter.$lte = new Date(dateTo);
      filter.createdAt = createdAtFilter;
    }

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('car')
        .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone email' } })
        .populate('user', 'name phone email')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.bookingModel.countDocuments(filter),
    ]);

    return { bookings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async assignDriver(bookingId: string, driverId: string) {
    const booking = await this.bookingModel
      .findByIdAndUpdate(
        bookingId,
        { driver: driverId, status: BookingStatus.DRIVER_ASSIGNED },
        { new: true },
      )
      .populate('car')
      .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone email' } })
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    this.logger.log(
      `Driver ${driverId} assigned to booking ${booking.bookingId}`,
    );

    // Notify customer + driver
    const driver = await this.driverModel
      .findById(driverId)
      .select('userId')
      .lean();
    const driverUser = driver
      ? await this.userModel.findById(driver.userId).select('name').lean()
      : null;
    this.notificationsService.onDriverAssigned(
      booking.user.toString(),
      booking.bookingId,
      driverUser?.name || 'Your driver',
      driver?.userId?.toString(),
    );

    return booking;
  }

  async updateStatus(bookingId: string, status: BookingStatus) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    booking.status = status;

    if (status === BookingStatus.DRIVER_EN_ROUTE) {
      booking.actualTimes = {
        ...booking.actualTimes,
        driverStarted: new Date(),
      };
    } else if (status === BookingStatus.PICKED_UP) {
      booking.actualTimes = {
        ...booking.actualTimes,
        pickedUp: new Date(),
      };
    } else if (status === BookingStatus.COMPLETED) {
      booking.actualTimes = {
        ...booking.actualTimes,
        completed: new Date(),
      };
    }

    await booking.save();
    this.logger.log(`Booking ${booking.bookingId} status → ${status}`);

    // Send notifications based on status
    const userId = booking.user.toString();
    const user = await this.userModel
      .findById(booking.user)
      .select('phone')
      .lean();
    const phone = user?.phone;

    if (status === BookingStatus.DRIVER_EN_ROUTE) {
      this.notificationsService.onDriverEnRoute(userId, booking.bookingId);
    } else if (status === BookingStatus.PICKED_UP) {
      this.notificationsService.onDriverArrived(userId, booking.bookingId);
    } else if (status === BookingStatus.IN_PROGRESS) {
      const driver = booking.driver
        ? await this.driverModel
            .findById(booking.driver)
            .select('userId')
            .lean()
        : null;
      const driverUser = driver
        ? await this.userModel.findById(driver.userId).select('name').lean()
        : null;
      this.notificationsService.onRideStarted(
        userId,
        booking.bookingId,
        driverUser?.name || 'Driver',
        phone,
      );
    } else if (status === BookingStatus.COMPLETED) {
      this.notificationsService.onRideCompleted(
        userId,
        booking.bookingId,
        booking.pricing.totalAmount,
        phone,
      );
    }

    return booking;
  }

  // Driver methods
  async findByDriver(userId: string, query: { status?: string }) {
    // userId is the User _id from JWT, but bookings store Driver profile _id
    const driver = await this.driverModel.findOne({ userId }).select('_id').lean();
    if (!driver) return [];

    const filter: any = { driver: driver._id };
    if (query.status) filter.status = query.status;

    return this.bookingModel
      .find(filter)
      .populate('car')
      .populate('user', 'name phone')
      .sort({ 'schedule.startDate': -1 })
      .lean();
  }

  async markStopReached(bookingId: string, stopOrder: number) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');

    const stop = booking.stops.find((s) => s.order === stopOrder);
    if (!stop) throw new BadRequestException(`Stop ${stopOrder} not found`);

    stop.status = 'reached';
    stop.reachedAt = new Date();
    await booking.save();

    this.logger.log(
      `Stop ${stopOrder} reached for booking ${booking.bookingId}`,
    );

    // Notify customer
    const userId = booking.user.toString();
    this.notificationsService.notify({
      userId,
      title: 'Stop Reached',
      body: `Driver reached stop ${stopOrder}: ${stop.address}`,
      type: 'general' as any,
      data: {
        bookingId: booking._id.toString(),
        url: `/customer/track/${booking._id.toString()}`,
      },
    });

    return booking;
  }

  async confirmPayment(bookingId: string) {
    const booking = await this.bookingModel
      .findByIdAndUpdate(
        bookingId,
        { status: BookingStatus.CONFIRMED },
        { new: true },
      )
      .lean();

    if (booking) {
      const user = await this.userModel
        .findById(booking.user)
        .select('phone')
        .lean();
      this.notificationsService.onBookingConfirmed(
        booking.user.toString(),
        booking.bookingId,
        booking.pricing.totalAmount,
        user?.phone,
      );
      this.notificationsService.onPaymentReceived(
        booking.user.toString(),
        booking.bookingId,
        booking.pricing.totalAmount,
      );
    }

    return booking;
  }
}
