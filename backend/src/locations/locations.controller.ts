import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocationsService } from './locations.service';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

// Public endpoint for customer booking form
@ApiTags('Locations - Public')
@Controller('locations')
export class PublicLocationsController {
  constructor(private locationsService: LocationsService) {}

  @Get('states')
  @ApiOperation({ summary: 'Get active states' })
  getStates() {
    return this.locationsService.getAllStates(false);
  }

  @Get('states/:stateId/cities')
  @ApiOperation({ summary: 'Get active cities for a state' })
  getCities(@Param('stateId') stateId: string) {
    return this.locationsService.getCitiesByState(stateId, false);
  }
}

// Admin endpoints
@ApiTags('Admin - Locations')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/locations')
export class AdminLocationsController {
  constructor(private locationsService: LocationsService) {}

  // ---- Stats ----
  @Get('stats')
  @ApiOperation({ summary: 'Get location stats' })
  getStats() {
    return this.locationsService.getStats();
  }

  // ---- States ----
  @Get('states')
  @ApiOperation({ summary: 'Get all states (including inactive)' })
  getAllStates() {
    return this.locationsService.getAllStates(true);
  }

  @Post('states')
  @ApiOperation({ summary: 'Create a state' })
  createState(@Body() body: { name: string; code: string }) {
    return this.locationsService.createState(body);
  }

  @Put('states/:id/toggle')
  @ApiOperation({ summary: 'Enable/disable a state' })
  toggleState(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.locationsService.toggleState(id, isActive);
  }

  @Delete('states/:id')
  @ApiOperation({ summary: 'Delete a state' })
  deleteState(@Param('id') id: string) {
    return this.locationsService.deleteState(id);
  }

  // ---- Cities ----
  @Get('cities')
  @ApiOperation({ summary: 'Get all cities (including inactive)' })
  getAllCities() {
    return this.locationsService.getAllCities(true);
  }

  @Get('states/:stateId/cities')
  @ApiOperation({ summary: 'Get cities for a state (including inactive)' })
  getCitiesByState(@Param('stateId') stateId: string) {
    return this.locationsService.getCitiesByState(stateId, true);
  }

  @Post('cities')
  @ApiOperation({ summary: 'Create a city' })
  createCity(
    @Body() body: { name: string; stateId: string; coordinates?: number[] },
  ) {
    return this.locationsService.createCity(body);
  }

  @Put('cities/:id/toggle')
  @ApiOperation({ summary: 'Enable/disable a city' })
  toggleCity(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.locationsService.toggleCity(id, isActive);
  }

  @Delete('cities/:id')
  @ApiOperation({ summary: 'Delete a city' })
  deleteCity(@Param('id') id: string) {
    return this.locationsService.deleteCity(id);
  }

  // ---- Routes toggle ----
  @Put('routes/:id/toggle')
  @ApiOperation({ summary: 'Enable/disable a route' })
  toggleRoute(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.locationsService.toggleRoute(id, isActive);
  }
}
