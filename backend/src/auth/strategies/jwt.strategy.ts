import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'books-jwt-secret-change-in-prod',
      ),
    });
  }

  async validate(payload: { sub: string; role: string }) {
    const user = await this.userModel
      .findById(payload.sub)
      .select('-passwordHash')
      .lean();

    if (!user || !user.isActive || user.isBlocked) {
      throw new UnauthorizedException('Account inactive or blocked');
    }

    return {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      email: user.email,
    };
  }
}
