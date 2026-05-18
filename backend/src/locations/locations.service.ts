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
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';

@Injectable()
export class LocationsService {
  private readonly logger = new Logger(LocationsService.name);

  constructor(
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(RoutePricing.name)
    private routeModel: Model<RoutePricingDocument>,
    @InjectModel(Booking.name)
    private bookingModel: Model<BookingDocument>,
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
    // Block disable if routes reference this state
    if (!isActive) {
      const routeCount = await this.routeModel.countDocuments({
        $or: [
          { fromStateId: new Types.ObjectId(id) },
          { toStateId: new Types.ObjectId(id) },
        ],
        isActive: true,
      });
      if (routeCount > 0) {
        throw new BadRequestException(
          `Cannot disable state — ${routeCount} active route(s) reference it. Disable those routes first.`,
        );
      }
    }

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
      this.logger.log(`State ${state.name} disabled — all its cities disabled`);
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
    const routeCount = await this.routeModel.countDocuments({
      $or: [
        { fromStateId: new Types.ObjectId(id) },
        { toStateId: new Types.ObjectId(id) },
      ],
    });
    if (routeCount > 0) {
      throw new BadRequestException(
        `Cannot delete state — ${routeCount} route(s) reference it.`,
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
    // Block disable if routes reference this city
    if (!isActive) {
      const routeCount = await this.routeModel.countDocuments({
        $or: [
          { fromCityId: new Types.ObjectId(id) },
          { toCityId: new Types.ObjectId(id) },
        ],
        isActive: true,
      });
      if (routeCount > 0) {
        throw new BadRequestException(
          `Cannot disable city — ${routeCount} active route(s) reference it. Disable those routes first.`,
        );
      }
    }

    const city = await this.cityModel.findByIdAndUpdate(
      id,
      { isActive },
      { new: true },
    );
    if (!city) throw new NotFoundException('City not found');
    return city;
  }

  async deleteCity(id: string) {
    const routeCount = await this.routeModel.countDocuments({
      $or: [
        { fromCityId: new Types.ObjectId(id) },
        { toCityId: new Types.ObjectId(id) },
      ],
    });
    if (routeCount > 0) {
      throw new BadRequestException(
        `Cannot delete city — ${routeCount} route(s) reference it.`,
      );
    }
    const city = await this.cityModel.findByIdAndDelete(id);
    if (!city) throw new NotFoundException('City not found');
    return { deleted: true };
  }

  // ---- Route enable/disable ----

  async toggleRoute(routeId: string, isActive: boolean) {
    if (!isActive) {
      // Check no active/in-progress bookings on this route
      const activeBookings = await this.bookingModel.countDocuments({
        status: {
          $in: [
            BookingStatus.PENDING,
            BookingStatus.CONFIRMED,
            BookingStatus.DRIVER_ASSIGNED,
            BookingStatus.DRIVER_EN_ROUTE,
            BookingStatus.PICKED_UP,
            BookingStatus.IN_PROGRESS,
          ],
        },
      });
      if (activeBookings > 0) {
        throw new BadRequestException(
          `Cannot disable route — ${activeBookings} active booking(s) exist. Wait until they complete.`,
        );
      }
    }

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
