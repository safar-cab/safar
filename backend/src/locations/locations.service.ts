import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  State,
  StateDocument,
  City,
  CityDocument,
} from '../schemas/geo.schema';
import {
  RoutePricing,
  RoutePricingDocument,
} from '../schemas/route-pricing.schema';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(RoutePricing.name)
    private routeModel: Model<RoutePricingDocument>,
  ) {}

  // ---- States ----

  async createState(data: { name: string; code: string }) {
    const state = await this.stateModel.create({
      name: data.name,
      code: data.code.toUpperCase(),
    });
    this.logger.log(`State created: ${state.name}`);
    return state;
  }

  async getAllStates(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return this.stateModel.find(filter).sort({ name: 1 }).lean();
  }

  async toggleState(id: string, isActive: boolean) {
    const state = await this.stateModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!state) throw new NotFoundException('State not found');

    // When disabling state, also disable its cities
    if (!isActive) {
      await this.cityModel.updateMany(
        { state: new Types.ObjectId(id) },
        { isActive: false },
      );
      this.logger.log(
        `State ${state.name} disabled — all its cities disabled`,
      );
    }

    return state;
  }

  async deleteState(id: string) {
    const cityCount = await this.cityModel.countDocuments({
      state: new Types.ObjectId(id),
    });
    if (cityCount > 0) {
      throw new BadRequestException(
        `Cannot delete state with ${cityCount} cities. Remove cities first.`,
      );
    }
    const state = await this.stateModel.findByIdAndDelete(id);
    if (!state) throw new NotFoundException('State not found');
    return { deleted: true };
  }

  // ---- Cities ----

  async createCity(data: {
    name: string;
    stateId: string;
    coordinates?: number[];
  }) {
    const state = await this.stateModel.findById(data.stateId).lean();
    if (!state) throw new NotFoundException('State not found');

    const city = await this.cityModel.create({
      name: data.name,
      state: new Types.ObjectId(data.stateId),
      coordinates: data.coordinates,
    });
    this.logger.log(`City created: ${city.name} in ${state.name}`);
    return city;
  }

  async getCitiesByState(stateId: string, includeInactive = false) {
    const filter: Record<string, unknown> = {
      state: new Types.ObjectId(stateId),
    };
    if (!includeInactive) filter.isActive = true;
    return this.cityModel.find(filter).sort({ name: 1 }).lean();
  }

  async getAllCities(includeInactive = false) {
    const filter = includeInactive ? {} : { isActive: true };
    return this.cityModel
      .find(filter)
      .populate('state', 'name code isActive')
      .sort({ name: 1 })
      .lean();
  }

  async toggleCity(id: string, isActive: boolean) {
    const city = await this.cityModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async deleteCity(id: string) {
    const city = await this.cityModel.findByIdAndDelete(id);
    if (!city) throw new NotFoundException('City not found');
    return { deleted: true };
  }

  // ---- Route enable/disable ----

  async toggleRoute(routeId: string, isActive: boolean) {
    // Check no active bookings on this route before disabling
    // (caller should verify — this just updates the flag)
    const route = await this.routeModel.findByIdAndUpdate(
      routeId,
      { isActive },
      { new: true },
    );
    if (!route) throw new NotFoundException('Route not found');
    this.logger.log(`Route ${route.name} ${isActive ? 'enabled' : 'disabled'}`);
    return route;
  }

  // ---- Stats ----

  async getStats() {
    const [states, cities, activeStates, activeCities] = await Promise.all([
      this.stateModel.countDocuments(),
      this.cityModel.countDocuments(),
      this.stateModel.countDocuments({ isActive: true }),
      this.cityModel.countDocuments({ isActive: true }),
    ]);
    return { states, cities, activeStates, activeCities };
  }
}
