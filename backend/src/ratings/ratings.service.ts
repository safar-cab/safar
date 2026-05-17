import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rating, RatingDocument } from '../schemas/rating.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    @InjectModel(Rating.name) private ratingModel: Model<RatingDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
  ) {}

  async createRating(
    fromUserId: string,
    raterRole: string,
    dto: { bookingId: string; rating: number; review?: string },
  ) {
    const booking = await this.bookingModel.findById(dto.bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only rate completed bookings');
    }

    // Determine who is being rated
    let toUserId: string;
    if (raterRole === 'customer') {
      if (!booking.driver) throw new BadRequestException('No driver assigned');
      toUserId = booking.driver.toString();
    } else {
      toUserId = booking.user.toString();
    }

    const existing = await this.ratingModel.findOne({
      booking: dto.bookingId,
      fromUser: fromUserId,
    });
    if (existing) throw new BadRequestException('Already rated this booking');

    const rating = await this.ratingModel.create({
      booking: dto.bookingId,
      fromUser: fromUserId,
      toUser: toUserId,
      raterRole,
      rating: dto.rating,
      review: dto.review,
    });

    // Update driver avg rating if rated by customer
    if (raterRole === 'customer' && booking.driver) {
      const ratings = await this.ratingModel
        .find({ toUser: booking.driver, raterRole: 'customer' })
        .lean();
      const avg =
        ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
      await this.driverModel.findOneAndUpdate(
        { userId: booking.driver },
        { avgRating: Math.round(avg * 10) / 10 },
      );
    }

    this.logger.log(
      `Rating created: ${dto.rating}/5 for booking ${dto.bookingId}`,
    );
    return rating;
  }

  async findByBooking(bookingId: string) {
    return this.ratingModel
      .find({ booking: bookingId })
      .populate('fromUser', 'name')
      .populate('toUser', 'name')
      .lean();
  }

  async findByUser(userId: string) {
    return this.ratingModel
      .find({ toUser: userId })
      .populate('fromUser', 'name')
      .populate('booking', 'bookingId')
      .sort({ createdAt: -1 })
      .lean();
  }
}
