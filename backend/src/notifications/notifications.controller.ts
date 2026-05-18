import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Register FCM token (web or mobile)
  @Post('fcm-token')
  async registerFcmToken(
    @CurrentUser('_id') userId: string,
    @Body() body: { token: string; platform?: 'web' | 'android' | 'ios' },
  ) {
    await this.userModel.updateOne(
      { _id: userId },
      { $addToSet: { fcmTokens: body.token } },
    );
    return { success: true };
  }

  // Remove FCM token (on logout)
  @Post('fcm-token/remove')
  async removeFcmToken(
    @CurrentUser('_id') userId: string,
    @Body() body: { token: string },
  ) {
    await this.userModel.updateOne(
      { _id: userId },
      { $pull: { fcmTokens: body.token } },
    );
    return { success: true };
  }

  // Get notifications
  @Get()
  async getNotifications(
    @CurrentUser('_id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.getByUser(userId, {
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      unreadOnly: unreadOnly === 'true',
    });
  }

  // Get unread count
  @Get('unread-count')
  async getUnreadCount(@CurrentUser('_id') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  // Mark single as read
  @Patch(':id/read')
  async markRead(@CurrentUser('_id') userId: string, @Param('id') id: string) {
    return this.notificationsService.markRead(userId, id);
  }

  // Mark all as read
  @Post('mark-all-read')
  async markAllRead(@CurrentUser('_id') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  // Update notification preferences
  @Patch('preferences')
  async updatePreferences(
    @CurrentUser('_id') userId: string,
    @Body()
    body: {
      pushEnabled?: boolean;
      smsEnabled?: boolean;
      emailEnabled?: boolean;
    },
  ) {
    const update: Record<string, boolean> = {};
    if (body.pushEnabled !== undefined)
      update['notificationPrefs.pushEnabled'] = body.pushEnabled;
    if (body.smsEnabled !== undefined)
      update['notificationPrefs.smsEnabled'] = body.smsEnabled;
    if (body.emailEnabled !== undefined)
      update['notificationPrefs.emailEnabled'] = body.emailEnabled;

    await this.userModel.updateOne({ _id: userId }, { $set: update });
    return { success: true };
  }

  // Get notification preferences
  @Get('preferences')
  async getPreferences(@CurrentUser('_id') userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('notificationPrefs')
      .lean();
    return (
      user?.notificationPrefs || {
        pushEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
      }
    );
  }
}
