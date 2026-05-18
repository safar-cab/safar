import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';
import { BookingStatus } from '../schemas/booking.schema';

@ApiTags('Customer - Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('customer/bookings')
export class CustomerBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List my bookings' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  findMyBookings(
    @CurrentUser('_id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.findByUser(userId, { page, limit, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancel(id, 'customer', reason);
  }
}

@ApiTags('Driver - Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver/bookings')
export class DriverBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List assigned bookings' })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  findMyRides(
    @CurrentUser('_id') driverId: string,
    @Query('status') status?: string,
  ) {
    return this.bookingsService.findByDriver(driverId, { status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking details' })
  findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put(':id/status')
  @ApiOperation({
    summary: 'Update ride status (en_route, picked_up, in_progress, completed)',
  })
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Put(':id/stops/:order/reached')
  @ApiOperation({ summary: 'Mark a stop as reached' })
  markStopReached(
    @Param('id') id: string,
    @Param('order') order: string,
  ) {
    return this.bookingsService.markStopReached(id, parseInt(order));
  }
}

@ApiTags('Admin - Bookings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/bookings')
export class AdminBookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all bookings (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'status', required: false, enum: BookingStatus })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'dateFrom', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'dateTo', required: false, example: '2026-12-31' })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.bookingsService.findAll({
      page,
      limit,
      status,
      search,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Put(':id/assign-driver')
  @ApiOperation({ summary: 'Assign driver to booking (admin)' })
  assignDriver(@Param('id') id: string, @Body('driverId') driverId: string) {
    return this.bookingsService.assignDriver(id, driverId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update booking status (admin)' })
  updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
    return this.bookingsService.updateStatus(id, status);
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (admin)' })
  cancel(@Param('id') id: string, @Body('reason') reason: string) {
    return this.bookingsService.cancel(id, 'admin', reason);
  }
}
