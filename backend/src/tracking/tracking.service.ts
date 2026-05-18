import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LocationHistory, LocationDocument } from '../schemas/location.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';

export interface LocationUpdate {
  bookingId: string;
  driverId: string;
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  // In-memory cache of latest positions for fast reads
  private livePositions = new Map<
    string,
    {
      latitude: number;
      longitude: number;
      speed: number;
      heading: number;
      updatedAt: Date;
    }
  >();

  constructor(
    @InjectModel(LocationHistory.name)
    private locationModel: Model<LocationDocument>,
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
  ) {}

  async saveLocation(data: LocationUpdate): Promise<void> {
    // Save to MongoDB (for history/replay)
    await this.locationModel.create({
      booking: new Types.ObjectId(data.bookingId),
      driver: new Types.ObjectId(data.driverId),
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading || 0,
      accuracy: data.accuracy || 0,
      point: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
    });

    // Update in-memory cache
    this.livePositions.set(data.bookingId, {
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading || 0,
      updatedAt: new Date(),
    });
  }

  getLivePosition(bookingId: string) {
    return this.livePositions.get(bookingId) || null;
  }

  getAllLivePositions() {
    const positions: Record<string, any> = {};
    this.livePositions.forEach((pos, bookingId) => {
      // Only return positions updated in last 2 minutes
      if (Date.now() - pos.updatedAt.getTime() < 120_000) {
        positions[bookingId] = pos;
      }
    });
    return positions;
  }

  removeLivePosition(bookingId: string) {
    this.livePositions.delete(bookingId);
  }

  async getLocationHistory(bookingId: string) {
    return this.locationModel
      .find({ booking: new Types.ObjectId(bookingId) })
      .sort({ createdAt: 1 })
      .select('latitude longitude speed heading createdAt')
      .lean();
  }

  async getActiveBookingsForDriver(driverId: string) {
    return this.bookingModel
      .find({
        driver: new Types.ObjectId(driverId),
        status: {
          $in: [
            BookingStatus.DRIVER_ASSIGNED,
            BookingStatus.DRIVER_EN_ROUTE,
            BookingStatus.PICKED_UP,
            BookingStatus.IN_PROGRESS,
          ],
        },
      })
      .select('_id bookingId status pickup drop user')
      .populate('user', 'name phone')
      .lean();
  }

  async getActiveBookingsForAdmin() {
    return this.bookingModel
      .find({
        status: {
          $in: [
            BookingStatus.DRIVER_EN_ROUTE,
            BookingStatus.PICKED_UP,
            BookingStatus.IN_PROGRESS,
          ],
        },
      })
      .select('_id bookingId status pickup drop driver user car schedule distance pricing')
      .populate({ path: 'driver', populate: { path: 'userId', select: 'name phone' } })
      .populate('user', 'name phone')
      .populate('car', 'make model registrationNumber category')
      .lean();
  }
}
