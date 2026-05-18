import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly authKey: string;
  private readonly senderId: string;
  private readonly route: string;
  private enabled: boolean;

  constructor(private configService: ConfigService) {
    this.authKey = this.configService.get<string>('MSG91_AUTH_KEY', '');
    this.senderId = this.configService.get<string>('MSG91_SENDER_ID', 'SAFAR');
    this.route = this.configService.get<string>('MSG91_ROUTE', '4'); // transactional
    this.enabled = !!this.authKey;

    if (!this.enabled) {
      this.logger.warn('MSG91 not configured — SMS disabled');
    }
  }

  async send(phone: string, templateId: string, variables: Record<string, string>): Promise<boolean> {
    if (!this.enabled) {
      this.logger.log(`SMS (dry-run) to ${phone}: template=${templateId}`);
      return true;
    }

    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/flow/',
        {
          template_id: templateId,
          sender: this.senderId,
          short_url: '0',
          mobiles: phone.startsWith('91') ? phone : `91${phone}`,
          ...variables,
        },
        {
          headers: {
            authkey: this.authKey,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`SMS sent to ${phone}: ${response.data?.type}`);
      return true;
    } catch (error) {
      this.logger.error(`SMS failed to ${phone}`, error?.response?.data || error.message);
      return false;
    }
  }

  async sendBookingConfirmed(phone: string, bookingId: string, amount: string) {
    return this.send(phone, this.configService.get('MSG91_TPL_BOOKING_CONFIRMED', ''), {
      booking_id: bookingId,
      amount,
    });
  }

  async sendRideStarted(phone: string, bookingId: string, driverName: string) {
    return this.send(phone, this.configService.get('MSG91_TPL_RIDE_STARTED', ''), {
      booking_id: bookingId,
      driver_name: driverName,
    });
  }

  async sendRideCompleted(phone: string, bookingId: string, amount: string) {
    return this.send(phone, this.configService.get('MSG91_TPL_RIDE_COMPLETED', ''), {
      booking_id: bookingId,
      amount,
    });
  }

  async sendBookingCancelled(phone: string, bookingId: string, refundAmount: string) {
    return this.send(phone, this.configService.get('MSG91_TPL_BOOKING_CANCELLED', ''), {
      booking_id: bookingId,
      refund_amount: refundAmount,
    });
  }
}
