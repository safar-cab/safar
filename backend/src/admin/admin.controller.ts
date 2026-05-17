import { Controller, Get, Put, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Admin - Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/dashboard')
export class AdminDashboardController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getRevenueChart(@Query('days') days?: number) {
    return this.adminService.getRevenueChart(days || 30);
  }

  @Get('booking-stats')
  @ApiOperation({ summary: 'Get booking statistics by status' })
  @ApiQuery({ name: 'days', required: false, example: 30 })
  getBookingStats(@Query('days') days?: number) {
    return this.adminService.getBookingStats(days || 30);
  }

  @Get('settings')
  @ApiOperation({ summary: 'Get company settings' })
  getSettings() {
    return this.adminService.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Update company settings' })
  updateSettings(@Body() dto: any) {
    return this.adminService.updateSettings(dto);
  }
}
