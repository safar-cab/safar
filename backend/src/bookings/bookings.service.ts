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

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
  ) {}

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

    // Calculate pricing (simplified — in production use RoutePricing)
    const pricePerKm = 12;
    const baseFare = 500;
    const distanceKm = dto.estimatedDistanceKm || 100;
    const distanceCharge = distanceKm * pricePerKm;
    const tollEstimate = 0;
    const totalAmount = baseFare + distanceCharge + tollEstimate;
    const gstAmount = Math.round(totalAmount * 0.05);

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
        totalAmount,
        gstAmount,
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
    if (status) filter.status = status;

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('car')
        .populate('driver')
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
      .populate('driver')
      .populate('user', 'name phone email')
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async findByBookingId(bookingId: string) {
    const booking = await this.bookingModel
      .findOne({ bookingId })
      .populate('car')
      .populate('driver')
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
    return booking;
  }

  // Admin methods
  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, search } = query;
    const filter: any = {};
    if (status) filter.status = status;
    if (search) filter.bookingId = { $regex: search, $options: 'i' };

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(filter)
        .populate('car')
        .populate('driver')
        .populate('user', 'name phone email')
        .sort({ createdAt: -1 })
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
      .populate('driver')
      .lean();
    if (!booking) throw new NotFoundException('Booking not found');
    this.logger.log(
      `Driver ${driverId} assigned to booking ${booking.bookingId}`,
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
    return booking;
  }

  // Driver methods
  async findByDriver(driverId: string, query: { status?: string }) {
    const filter: any = { driver: driverId };
    if (query.status) filter.status = query.status;

    return this.bookingModel
      .find(filter)
      .populate('car')
      .populate('user', 'name phone')
      .sort({ 'schedule.startDate': -1 })
      .lean();
  }

  async confirmPayment(bookingId: string) {
    return this.bookingModel
      .findByIdAndUpdate(
        bookingId,
        { status: BookingStatus.CONFIRMED },
        { new: true },
      )
      .lean();
  }
}
