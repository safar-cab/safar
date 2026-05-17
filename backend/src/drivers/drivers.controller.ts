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
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Driver - Self')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver')
export class DriverSelfController {
  constructor(private driversService: DriversService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get own driver profile' })
  getMyProfile(@CurrentUser('_id') userId: string) {
    return this.driversService.findByUserId(userId);
  }

  @Put('availability')
  @ApiOperation({ summary: 'Toggle availability' })
  updateAvailability(
    @CurrentUser('_id') userId: string,
    @Body('isAvailable') isAvailable: boolean,
  ) {
    return this.driversService.updateAvailability(userId, isAvailable);
  }

  @Put('location')
  @ApiOperation({ summary: 'Update current location' })
  updateLocation(
    @CurrentUser('_id') userId: string,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.driversService.updateLocation(
      userId,
      dto.latitude,
      dto.longitude,
    );
  }
}

@ApiTags('Admin - Drivers')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/drivers')
export class AdminDriversController {
  constructor(private driversService: DriversService) {}

  @Post()
  @ApiOperation({ summary: 'Create driver profile (admin)' })
  create(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all drivers (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'isVerified', required: false })
  @ApiQuery({ name: 'isAvailable', required: false })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('isVerified') isVerified?: boolean,
    @Query('isAvailable') isAvailable?: boolean,
  ) {
    return this.driversService.findAll({
      page,
      limit,
      isVerified,
      isAvailable,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get driver by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.driversService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update driver (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify driver (admin)' })
  verify(@Param('id') id: string) {
    return this.driversService.verify(id);
  }
}
