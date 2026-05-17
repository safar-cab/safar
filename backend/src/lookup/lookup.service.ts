import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { Car, CarDocument } from '../schemas/car.schema';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { RoutePricing, RoutePricingDocument } from '../schemas/route-pricing.schema';

@Injectable()
export class LookupService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(Driver.name) private driverModel: Model<DriverDocument>,
    @InjectModel(RoutePricing.name) private routeModel: Model<RoutePricingDocument>,
  ) {}

  async getActiveDrivers(search?: string) {
    const filter: Record<string, unknown> = { isVerified: true };
    if (search) {
      const matchingUsers = await this.userModel
        .find({
          role: 'driver' as UserRole,
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { phone: { $regex: search, $options: 'i' } },
          ],
        })
        .select('_id')
        .lean();
      filter.userId = { $in: matchingUsers.map((u) => u._id) };
    }
    return this.driverModel
      .find(filter)
      .populate('userId', 'name phone')
      .select('_id userId licenseNumber avgRating isAvailable')
      .lean();
  }

  async getActiveCars(search?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (search) {
      filter.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
      ];
    }
    return this.carModel
      .find(filter)
      .select('_id registrationNumber make model category seats color')
      .sort({ make: 1, model: 1 })
      .lean();
  }

  async getDriverUsers(search?: string) {
    const filter: Record<string, unknown> = {
      role: UserRole.DRIVER,
      isActive: true,
      isBlocked: false,
    };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    return this.userModel
      .find(filter)
      .select('_id name phone email')
      .sort({ name: 1 })
      .lean();
  }

  async getCustomerUsers(search?: string) {
    const filter: Record<string, unknown> = {
      role: UserRole.CUSTOMER,
      isActive: true,
      isBlocked: false,
    };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    return this.userModel
      .find(filter)
      .select('_id name phone email')
      .sort({ name: 1 })
      .lean();
  }

  async getActiveRoutes(search?: string) {
    const filter: Record<string, unknown> = { isActive: true };
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    return this.routeModel
      .find(filter)
      .select('_id name distanceKm pricePerKm baseFare')
      .sort({ name: 1 })
      .lean();
  }

  async getCarCategories() {
    return this.carModel.distinct('category', { isActive: true });
  }

  async getBookingStatuses() {
    return [
      'pending', 'confirmed', 'driver_assigned', 'driver_en_route',
      'picked_up', 'in_progress', 'completed', 'cancelled', 'refunded',
    ];
  }

  async getUserRoles() {
    return ['customer', 'driver', 'admin'];
  }
}
