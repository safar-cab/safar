import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LookupService } from './lookup.service';

@ApiTags('Lookup')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('lookup')
export class LookupController {
  constructor(private lookupService: LookupService) {}

  @Get('drivers')
  @ApiOperation({ summary: 'Active verified drivers for dropdown' })
  @ApiQuery({ name: 'search', required: false })
  getDrivers(@Query('search') search?: string) {
    return this.lookupService.getActiveDrivers(search);
  }

  @Get('cars')
  @ApiOperation({ summary: 'Active cars for dropdown' })
  @ApiQuery({ name: 'search', required: false })
  getCars(@Query('search') search?: string) {
    return this.lookupService.getActiveCars(search);
  }

  @Get('driver-users')
  @ApiOperation({ summary: 'Driver role users for dropdown' })
  @ApiQuery({ name: 'search', required: false })
  getDriverUsers(@Query('search') search?: string) {
    return this.lookupService.getDriverUsers(search);
  }

  @Get('customer-users')
  @ApiOperation({ summary: 'Customer role users for dropdown' })
  @ApiQuery({ name: 'search', required: false })
  getCustomerUsers(@Query('search') search?: string) {
    return this.lookupService.getCustomerUsers(search);
  }

  @Get('routes')
  @ApiOperation({ summary: 'Active routes for dropdown' })
  @ApiQuery({ name: 'search', required: false })
  getRoutes(@Query('search') search?: string) {
    return this.lookupService.getActiveRoutes(search);
  }

  @Get('car-categories')
  @ApiOperation({ summary: 'Available car categories' })
  getCarCategories() {
    return this.lookupService.getCarCategories();
  }

  @Get('booking-statuses')
  @ApiOperation({ summary: 'All booking status values' })
  getBookingStatuses() {
    return this.lookupService.getBookingStatuses();
  }

  @Get('user-roles')
  @ApiOperation({ summary: 'All user role values' })
  getUserRoles() {
    return this.lookupService.getUserRoles();
  }
}
