import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Notification,
  NotificationDocument,
  NotificationType,
} from '../schemas/notification.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { PushService } from './push.service';
import { SmsService } from './sms.service';

interface NotifyOptions {
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  sendPush?: boolean;
  sendSms?: boolean;
  smsPhone?: string;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private pushService: PushService,
    private smsService: SmsService,
  ) {}

  async notify(options: NotifyOptions): Promise<NotificationDocument> {
    const { userId, title, body, type, data, sendPush = true } = options;

    // Save to DB
    const notification = await this.notificationModel.create({
      user: new Types.ObjectId(userId),
      title,
      body,
      type,
      data,
    });

    // Fetch user prefs + tokens
    const user = await this.userModel
      .findById(userId)
      .select('fcmTokens notificationPrefs')
      .lean();

    // Send push (web + mobile — FCM handles both)
    const pushEnabled = user?.notificationPrefs?.pushEnabled !== false;
    if (sendPush && pushEnabled && user?.fcmTokens?.length) {
      const invalidTokens = await this.pushService.sendToUser(
        user.fcmTokens,
        title,
        body,
        data,
      );

      // Remove invalid tokens
      if (invalidTokens.length > 0) {
        await this.userModel.updateOne(
          { _id: userId },
          { $pull: { fcmTokens: { $in: invalidTokens } } },
        );
        this.logger.log(
          `Removed ${invalidTokens.length} invalid FCM tokens for user ${userId}`,
        );
      }
    }

    return notification;
  }

  async getByUser(
    userId: string,
    query: { page?: number; limit?: number; unreadOnly?: boolean },
  ) {
    const { page = 1, limit = 20, unreadOnly } = query;
    const filter: Record<string, unknown> = {
      user: new Types.ObjectId(userId),
    };
    if (unreadOnly) filter.read = false;

    const [notifications, total, unreadCount] = await Promise.all([
      this.notificationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.notificationModel.countDocuments(filter),
      this.notificationModel.countDocuments({
        user: new Types.ObjectId(userId),
        read: false,
      }),
    ]);

    return {
      notifications,
      total,
      unreadCount,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markRead(userId: string, notificationId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: notificationId, user: new Types.ObjectId(userId) },
      { read: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      { user: new Types.ObjectId(userId), read: false },
      { read: true, readAt: new Date() },
    );
    return { marked: result.modifiedCount };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      user: new Types.ObjectId(userId),
      read: false,
    });
  }

  // --- Booking lifecycle notification helpers ---

  private async shouldSendSms(userId: string): Promise<boolean> {
    const user = await this.userModel
      .findById(userId)
      .select('notificationPrefs')
      .lean();
    return user?.notificationPrefs?.smsEnabled !== false;
  }

  async onBookingConfirmed(
    userId: string,
    bookingId: string,
    amount: number,
    phone?: string,
  ) {
    await this.notify({
      userId,
      title: 'Booking Confirmed',
      body: `Your booking ${bookingId} is confirmed. Total: ₹${amount.toLocaleString('en-IN')}`,
      type: NotificationType.BOOKING_CONFIRMED,
      data: { bookingId, url: '/customer/bookings' },
    });
    if (phone && (await this.shouldSendSms(userId))) {
      void this.smsService.sendBookingConfirmed(
        phone,
        bookingId,
        amount.toString(),
      );
    }
  }

  async onDriverAssigned(
    userId: string,
    bookingId: string,
    driverName: string,
    driverUserId?: string,
  ) {
    // Notify customer
    await this.notify({
      userId,
      title: 'Driver Assigned',
      body: `${driverName} has been assigned to your ride ${bookingId}`,
      type: NotificationType.DRIVER_ASSIGNED,
      data: { bookingId, url: '/customer/bookings' },
    });

    // Notify driver
    if (driverUserId) {
      await this.notify({
        userId: driverUserId,
        title: 'New Ride Assigned',
        body: `You have been assigned ride ${bookingId}`,
        type: NotificationType.DRIVER_ASSIGNED,
        data: { bookingId, url: '/driver/rides' },
      });
    }
  }

  async onDriverEnRoute(userId: string, bookingId: string) {
    await this.notify({
      userId,
      title: 'Driver En Route',
      body: `Your driver is on the way for ride ${bookingId}`,
      type: NotificationType.DRIVER_EN_ROUTE,
      data: { bookingId, url: `/customer/track/${bookingId}` },
    });
  }

  async onDriverArrived(userId: string, bookingId: string) {
    await this.notify({
      userId,
      title: 'Driver Arrived',
      body: `Your driver has arrived for ride ${bookingId}`,
      type: NotificationType.DRIVER_ARRIVED,
      data: { bookingId, url: `/customer/track/${bookingId}` },
    });
  }

  async onRideStarted(
    userId: string,
    bookingId: string,
    driverName: string,
    phone?: string,
  ) {
    await this.notify({
      userId,
      title: 'Ride Started',
      body: `Your ride ${bookingId} has started`,
      type: NotificationType.RIDE_STARTED,
      data: { bookingId, url: `/customer/track/${bookingId}` },
    });
    if (phone && (await this.shouldSendSms(userId))) {
      void this.smsService.sendRideStarted(phone, bookingId, driverName);
    }
  }

  async onRideCompleted(
    userId: string,
    bookingId: string,
    amount: number,
    phone?: string,
  ) {
    await this.notify({
      userId,
      title: 'Ride Completed',
      body: `Your ride ${bookingId} is complete. Total: ₹${amount.toLocaleString('en-IN')}`,
      type: NotificationType.RIDE_COMPLETED,
      data: { bookingId, url: '/customer/bookings' },
    });
    if (phone && (await this.shouldSendSms(userId))) {
      void this.smsService.sendRideCompleted(
        phone,
        bookingId,
        amount.toString(),
      );
    }
  }

  async onBookingCancelled(
    userId: string,
    bookingId: string,
    refundAmount: number,
    phone?: string,
    driverUserId?: string,
  ) {
    await this.notify({
      userId,
      title: 'Booking Cancelled',
      body: `Booking ${bookingId} cancelled. Refund: ₹${refundAmount.toLocaleString('en-IN')}`,
      type: NotificationType.BOOKING_CANCELLED,
      data: { bookingId, url: '/customer/bookings' },
    });
    if (phone && (await this.shouldSendSms(userId))) {
      void this.smsService.sendBookingCancelled(
        phone,
        bookingId,
        refundAmount.toString(),
      );
    }
    if (driverUserId) {
      await this.notify({
        userId: driverUserId,
        title: 'Ride Cancelled',
        body: `Ride ${bookingId} has been cancelled`,
        type: NotificationType.BOOKING_CANCELLED,
        data: { bookingId, url: '/driver/rides' },
      });
    }
  }

  async onPaymentReceived(userId: string, bookingId: string, amount: number) {
    await this.notify({
      userId,
      title: 'Payment Received',
      body: `Payment of ₹${amount.toLocaleString('en-IN')} received for ${bookingId}`,
      type: NotificationType.PAYMENT_RECEIVED,
      data: { bookingId, url: '/customer/bookings' },
    });
  }
}
