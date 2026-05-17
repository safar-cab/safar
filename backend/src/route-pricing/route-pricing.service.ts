import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  RoutePricing,
  RoutePricingDocument,
} from '../schemas/route-pricing.schema';
import { CreateRoutePricingDto } from './dto/create-route-pricing.dto';

@Injectable()
export class RoutePricingService {
  private readonly logger = new Logger(RoutePricingService.name);

  constructor(
    @InjectModel(RoutePricing.name)
    private routeModel: Model<RoutePricingDocument>,
  ) {}

  async create(dto: CreateRoutePricingDto) {
    const route = await this.routeModel.create(dto);
    this.logger.log(`Route created: ${dto.name}`);
    return route;
  }

  async findAll() {
    return this.routeModel.find({ isActive: true }).sort({ name: 1 }).lean();
  }

  async findById(id: string) {
    const route = await this.routeModel.findById(id).lean();
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async update(id: string, dto: Partial<CreateRoutePricingDto>) {
    const route = await this.routeModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true })
      .lean();
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async deactivate(id: string) {
    return this.routeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .lean();
  }
}
