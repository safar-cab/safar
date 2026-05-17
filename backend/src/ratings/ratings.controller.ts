import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';

@ApiTags('Customer - Ratings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.CUSTOMER)
@Controller('customer/ratings')
export class CustomerRatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Rate a completed ride' })
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateRatingDto) {
    return this.ratingsService.createRating(userId, 'customer', dto);
  }

  @Get('booking/:bookingId')
  @ApiOperation({ summary: 'Get ratings for a booking' })
  findByBooking(@Param('bookingId') bookingId: string) {
    return this.ratingsService.findByBooking(bookingId);
  }
}

@ApiTags('Driver - Ratings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver/ratings')
export class DriverRatingsController {
  constructor(private ratingsService: RatingsService) {}

  @Post()
  @ApiOperation({ summary: 'Rate a customer after ride' })
  create(@CurrentUser('_id') userId: string, @Body() dto: CreateRatingDto) {
    return this.ratingsService.createRating(userId, 'driver', dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my ratings' })
  getMyRatings(@CurrentUser('_id') userId: string) {
    return this.ratingsService.findByUser(userId);
  }
}
