import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Car, CarDocument } from '../schemas/car.schema';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';

@Injectable()
export class CarsService {
  private readonly logger = new Logger(CarsService.name);

  constructor(@InjectModel(Car.name) private carModel: Model<CarDocument>) {}

  async create(dto: CreateCarDto) {
    const existing = await this.carModel.findOne({
      registrationNumber: dto.registrationNumber,
    });
    if (existing)
      throw new ConflictException('Car with this registration already exists');

    const car = await this.carModel.create(dto as any);
    this.logger.log(`Car created: ${dto.registrationNumber}`);
    return car;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 1, limit = 20, category, isActive, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;

    const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [cars, total] = await Promise.all([
      this.carModel
        .find(filter)
        .populate('assignedDriver')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.carModel.countDocuments(filter),
    ]);

    return { cars, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAvailable(query: {
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const filter: any = { isActive: true };
    if (query.category) filter.category = query.category;
    return this.carModel.find(filter).populate('assignedDriver').lean();
  }

  async findById(id: string) {
    const car = await this.carModel
      .findById(id)
      .populate('assignedDriver')
      .lean();
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async update(id: string, dto: UpdateCarDto) {
    const car = await this.carModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();
    if (!car) throw new NotFoundException('Car not found');
    this.logger.log(`Car updated: ${id}`);
    return car;
  }

  async deactivate(id: string) {
    const car = await this.carModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
    if (!car) throw new NotFoundException('Car not found');
    this.logger.warn(`Car deactivated: ${id}`);
    return car;
  }

  async activate(id: string) {
    const car = await this.carModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .lean();
    if (!car) throw new NotFoundException('Car not found');
    return car;
  }

  async assignDriver(carId: string, driverId: string) {
    const car = await this.carModel
      .findByIdAndUpdate(carId, { assignedDriver: driverId }, { new: true })
      .populate('assignedDriver')
      .lean();
    if (!car) throw new NotFoundException('Car not found');
    this.logger.log(`Driver ${driverId} assigned to car ${carId}`);
    return car;
  }
}
