import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
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
    const { page = 1, limit = 20, isVerified, isAvailable, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: Record<string, unknown> = {};
    if (isVerified !== undefined) filter.isVerified = isVerified;
    if (isAvailable !== undefined) filter.isAvailable = isAvailable;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

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
      .findOne({ userId: userId.toString() })
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
    const driver = await this.driverModel
      .findOneAndUpdate(
        { userId: userId.toString() },
        { isAvailable },
        { new: true },
      )
      .lean();
    if (!driver) throw new NotFoundException('Driver profile not found');
    return driver;
  }

  async updateLocation(userId: string, latitude: number, longitude: number) {
    const driver = await this.driverModel
      .findOneAndUpdate(
        { userId: userId.toString() },
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
