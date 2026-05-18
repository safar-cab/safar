import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../schemas/notification.schema';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  // Track deactivation attempts per driver (in-memory, resets on restart)
  private deactivateAttempts = new Map<string, number>();

  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateDriverDto) {
    const existing = await this.driverModel.findOne({
      $or: [{ userId: dto.userId }, { licenseNumber: dto.licenseNumber }],
    });
    if (existing) throw new ConflictException('Driver profile already exists');

    const driver = await this.driverModel.create(dto);
    this.logger.log(`Driver profile created: ${dto.licenseNumber}`);
    return driver;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    isVerified?: boolean;
    isAvailable?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      isVerified,
      isAvailable,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;
    const filter: Record<string, unknown> = {};
    if (isVerified !== undefined) filter.isVerified = isVerified;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;

    const sort: Record<string, 1 | -1> = {
      [sortBy]: sortOrder === 'asc' ? 1 : -1,
    };

    let drivers;
    let total: number;

    if (search) {
      // Search by driver name/phone via populate match
      const allDrivers = await this.driverModel
        .find(filter)
        .populate({
          path: 'userId',
          select: 'name phone email',
          match: {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { phone: { $regex: search, $options: 'i' } },
            ],
          },
        })
        .sort(sort)
        .lean();

      // Filter out drivers where populate match returned null
      const filtered = allDrivers.filter((d) => d.userId !== null);
      total = filtered.length;
      drivers = filtered.slice((page - 1) * limit, page * limit);
    } else {
      [drivers, total] = await Promise.all([
        this.driverModel
          .find(filter)
          .populate('userId', 'name phone email')
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        this.driverModel.countDocuments(filter),
      ]);
    }

    return { drivers, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const driver = await this.driverModel
      .findById(id)
      .populate('userId', 'name phone email')
      .lean();
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findByUserId(userId: string) {
    this.logger.debug(
      `findByUserId called with: ${userId} (type: ${typeof userId})`,
    );
    // Try both string and ObjectId match
    const driver = await this.driverModel
      .findOne({ userId })
      .populate('userId', 'name phone email')
      .lean();
    if (!driver) {
      // Fallback: check total count
      const count = await this.driverModel.countDocuments();
      this.logger.debug(`No driver found. Total drivers in DB: ${count}`);
      const all = await this.driverModel.find().lean();
      this.logger.debug(
        `All driver userIds: ${all.map((d) => d.userId).join(', ')}`,
      );
      throw new NotFoundException('Driver profile not found');
    }
    return driver;
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.driverModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .populate('userId', 'name phone email')
      .lean();
    if (!driver) throw new NotFoundException('Driver not found');
    this.logger.log(`Driver updated: ${id}`);
    return driver;
  }

  async verify(id: string) {
    const driver = await this.driverModel
      .findByIdAndUpdate(id, { isVerified: true }, { new: true })
      .lean();
    if (!driver) throw new NotFoundException('Driver not found');
    this.logger.log(`Driver verified: ${id}`);
    return driver;
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const driver = await this.driverModel.findOne({ userId }).lean();
    if (!driver) throw new NotFoundException('Driver profile not found');

    // Going offline — check for active rides
    if (!isAvailable) {
      const activeRideCount = await this.bookingModel.countDocuments({
        driver: driver._id,
        status: {
          $in: [
            BookingStatus.DRIVER_ASSIGNED,
            BookingStatus.DRIVER_EN_ROUTE,
            BookingStatus.PICKED_UP,
            BookingStatus.IN_PROGRESS,
          ],
        },
      });

      if (activeRideCount > 0) {
        // Track attempts
        const key = userId.toString();
        const attempts = (this.deactivateAttempts.get(key) || 0) + 1;
        this.deactivateAttempts.set(key, attempts);

        this.logger.warn(
          `Driver ${userId} tried to go offline with ${activeRideCount} active rides (attempt ${attempts})`,
        );

        // On 3rd+ attempt, notify admin
        if (attempts >= 3) {
          this.deactivateAttempts.set(key, 0); // reset after notifying

          const driverUser = await this.userModel
            .findById(userId)
            .select('name phone')
            .lean();
          const adminUsers = await this.userModel
            .find({ role: UserRole.ADMIN })
            .select('_id')
            .lean();

          for (const admin of adminUsers) {
            void this.notificationsService.notify({
              userId: admin._id.toString(),
              title: 'Driver Wants to Go Offline',
              body: `${driverUser?.name || 'A driver'} (${driverUser?.phone || ''}) has tried to go offline ${attempts} times but has ${activeRideCount} active ride(s).`,
              type: NotificationType.GENERAL,
              data: { url: '/admin/drivers' },
            });
          }
        }

        throw new BadRequestException(
          `Cannot go offline — you have ${activeRideCount} active ride(s). Complete or hand over your rides first.`,
        );
      }

      // No active rides — reset attempts and allow
      this.deactivateAttempts.delete(userId.toString());
    }

    const updated = await this.driverModel
      .findOneAndUpdate({ userId }, { isAvailable }, { new: true })
      .lean();
    return updated;
  }

  async updateLocation(userId: string, latitude: number, longitude: number) {
    const driver = await this.driverModel
      .findOneAndUpdate(
        { userId },
        {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
        { new: true },
      )
      .lean();
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }
}
