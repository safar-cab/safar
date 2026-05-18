import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { RoutesApiService } from './routes-api.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/tracking')
export class TrackingController {
  constructor(
    private trackingService: TrackingService,
    private routesApiService: RoutesApiService,
  ) {}

  @Get(':bookingId/position')
  @ApiOperation({ summary: 'Get current driver position for a booking' })
  getPosition(@Param('bookingId') bookingId: string) {
    const position = this.trackingService.getLivePosition(bookingId);
    return position || { latitude: null, longitude: null };
  }

  @Get(':bookingId/history')
  @ApiOperation({ summary: 'Get location history for a booking' })
  getHistory(@Param('bookingId') bookingId: string) {
    return this.trackingService.getLocationHistory(bookingId);
  }

  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('admin/active')
  @ApiOperation({ summary: 'Get all active ride positions (admin)' })
  async getActiveRides() {
    const bookings = await this.trackingService.getActiveBookingsForAdmin();
    const positions = this.trackingService.getAllLivePositions();
    return { bookings, positions };
  }

  @Get('route-info')
  @ApiOperation({
    summary: 'Get route info with toll estimates from Google Routes API',
  })
  @ApiQuery({ name: 'origin', required: true, example: 'Indore, MP' })
  @ApiQuery({ name: 'destination', required: true, example: 'Bhopal, MP' })
  async getRouteInfo(
    @Query('origin') origin: string,
    @Query('destination') destination: string,
  ) {
    return this.routesApiService.getRouteTollEstimate(origin, destination);
  }
}
