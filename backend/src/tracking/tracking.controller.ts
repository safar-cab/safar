import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrackingService } from './tracking.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Tracking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('api/tracking')
export class TrackingController {
  constructor(private trackingService: TrackingService) {}

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
    const [bookings, positions] = await Promise.all([
      this.trackingService.getActiveBookingsForAdmin(),
      this.trackingService.getAllLivePositions(),
    ]);
    return { bookings, positions };
  }
}
