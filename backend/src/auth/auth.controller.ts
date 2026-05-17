import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Customer Auth')
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new customer' })
  @ApiResponse({ status: 201, description: 'Customer registered successfully' })
  @ApiResponse({ status: 409, description: 'Phone already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.registerCustomer(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Customer login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }
}

@ApiTags('Driver Auth')
@Controller('driver/auth')
export class DriverAuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new driver' })
  @ApiResponse({ status: 201, description: 'Driver registered successfully' })
  @ApiResponse({ status: 409, description: 'Phone already registered' })
  register(@Body() dto: RegisterDto) {
    return this.authService.registerDriver(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Driver login' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.phone, dto.password);
  }
}

@ApiTags('Admin Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({ status: 200, description: 'Admin login successful' })
  @ApiResponse({ status: 401, description: 'Invalid admin credentials' })
  login(@Body() dto: LoginDto) {
    return this.authService.adminLogin(dto.phone, dto.password);
  }
}
