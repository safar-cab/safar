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
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Customer - Cars')
@Controller('customer/cars')
export class CustomerCarsController {
  constructor(private carsService: CarsService) {}

  @Get('available')
  @ApiOperation({ summary: 'List available cars for booking' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  findAvailable(
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.carsService.findAvailable({ category, startDate, endDate });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car details' })
  findById(@Param('id') id: string) {
    return this.carsService.findById(id);
  }
}

@ApiTags('Admin - Cars')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/cars')
export class AdminCarsController {
  constructor(private carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Add new car (admin)' })
  create(@Body() dto: CreateCarDto) {
    return this.carsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all cars (admin)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'sortBy', required: false, example: 'createdAt' })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('category') category?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.carsService.findAll({ page, limit, category, sortBy, sortOrder });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get car by ID (admin)' })
  findById(@Param('id') id: string) {
    return this.carsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update car (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateCarDto) {
    return this.carsService.update(id, dto);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate car (admin)' })
  deactivate(@Param('id') id: string) {
    return this.carsService.deactivate(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate car (admin)' })
  activate(@Param('id') id: string) {
    return this.carsService.activate(id);
  }

  @Put(':id/assign-driver/:driverId')
  @ApiOperation({ summary: 'Assign driver to car (admin)' })
  assignDriver(@Param('id') id: string, @Param('driverId') driverId: string) {
    return this.carsService.assignDriver(id, driverId);
  }
}
