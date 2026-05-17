import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument, UserRole } from '../schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async registerCustomer(dto: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) {
    const existing = await this.userModel.findOne({ phone: dto.phone });
    if (existing)
      throw new ConflictException('Phone number already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      role: UserRole.CUSTOMER,
    });

    this.logger.log(`Customer registered: ${user.phone}`);
    return this.generateToken(user);
  }

  async registerDriver(dto: {
    name: string;
    phone: string;
    email?: string;
    password: string;
  }) {
    const existing = await this.userModel.findOne({ phone: dto.phone });
    if (existing)
      throw new ConflictException('Phone number already registered');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      role: UserRole.DRIVER,
    });

    this.logger.log(`Driver registered: ${user.phone}`);
    return this.generateToken(user);
  }

  async login(phone: string, password: string) {
    const user = await this.userModel.findOne({ phone });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (user.isBlocked) throw new UnauthorizedException('Account is blocked');
    if (!user.isActive) throw new UnauthorizedException('Account is inactive');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    user.lastLogin = new Date();
    await user.save();

    this.logger.log(`User logged in: ${user.phone} (${user.role})`);
    return this.generateToken(user);
  }

  async adminLogin(phone: string, password: string) {
    const user = await this.userModel.findOne({ phone, role: UserRole.ADMIN });
    if (!user) throw new UnauthorizedException('Invalid admin credentials');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException('Invalid admin credentials');

    user.lastLogin = new Date();
    await user.save();

    this.logger.log(`Admin logged in: ${user.phone}`);
    return this.generateToken(user);
  }

  private generateToken(user: UserDocument) {
    const payload = { sub: user._id.toString(), role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    };
  }
}
