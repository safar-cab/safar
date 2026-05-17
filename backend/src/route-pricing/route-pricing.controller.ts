import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoutePricingService } from './route-pricing.service';
import { CreateRoutePricingDto } from './dto/create-route-pricing.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Customer - Routes')
@Controller('customer/routes')
export class CustomerRoutesController {
  constructor(private routePricingService: RoutePricingService) {}

  @Get()
  @ApiOperation({ summary: 'List available routes with pricing' })
  findAll() {
    return this.routePricingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route details' })
  findById(@Param('id') id: string) {
    return this.routePricingService.findById(id);
  }
}

@ApiTags('Admin - Route Pricing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/routes')
export class AdminRoutesController {
  constructor(private routePricingService: RoutePricingService) {}

  @Post()
  @ApiOperation({ summary: 'Create route pricing (admin)' })
  create(@Body() dto: CreateRoutePricingDto) {
    return this.routePricingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all routes (admin)' })
  findAll() {
    return this.routePricingService.findAll();
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update route pricing (admin)' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateRoutePricingDto>) {
    return this.routePricingService.update(id, dto);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate route (admin)' })
  deactivate(@Param('id') id: string) {
    return this.routePricingService.deactivate(id);
  }
}
