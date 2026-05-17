import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getProfile(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(
    userId: string,
    dto: {
      name?: string;
      email?: string;
      profilePhoto?: string;
      address?: any;
    },
  ) {
    const user = await this.userModel
      .findByIdAndUpdate(userId, { $set: dto }, { new: true })
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    this.logger.log(`Profile updated: ${userId}`);
    return user;
  }

  // Admin methods
  async findAll(query: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, role, search } = query;
    const filter: any = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.userModel.countDocuments(filter),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async blockUser(userId: string, reason: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { isBlocked: true, blockReason: reason },
        { new: true },
      )
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    this.logger.warn(`User blocked: ${userId} - ${reason}`);
    return user;
  }

  async unblockUser(userId: string) {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        { isBlocked: false, blockReason: null },
        { new: true },
      )
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    this.logger.log(`User unblocked: ${userId}`);
    return user;
  }

  async getUserById(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('-passwordHash')
      .lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
