import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false,
      auth: {
        user: this.configService.get('SMTP_USER', ''),
        pass: this.configService.get('SMTP_PASS', ''),
      },
    });
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.configService.get(
          'SMTP_FROM',
          '"Safar" <noreply@books.in>',
        ),
        to,
        subject,
        html,
      });
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error);
    }
  }

  async sendBookingConfirmation(
    to: string,
    data: { bookingId: string; pickup: string; drop: string; date: string; amount: number },
  ) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1E40AF; font-size: 24px; margin: 0;">Safar</h1>
        </div>
        <div style="background: #F8FAFC; border-radius: 12px; padding: 24px; border: 1px solid #E2E8F0;">
          <h2 style="color: #059669; font-size: 20px; margin: 0 0 16px;">Booking Confirmed!</h2>
          <p style="color: #475569; margin: 8px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Pickup:</strong> ${data.pickup}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Drop:</strong> ${data.drop}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Date:</strong> ${data.date}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
        </div>
        <p style="color: #94A3B8; font-size: 12px; text-align: center; margin-top: 24px;">
          Thank you for choosing Safar
        </p>
      </div>
    `;
    await this.sendMail(to, `Booking Confirmed - ${data.bookingId}`, html);
  }

  async sendCancellationEmail(
    to: string,
    data: { bookingId: string; refundAmount: number },
  ) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1E40AF; font-size: 24px; margin: 0;">Safar</h1>
        </div>
        <div style="background: #FFF1F2; border-radius: 12px; padding: 24px; border: 1px solid #FFE4E6;">
          <h2 style="color: #E11D48; font-size: 20px; margin: 0 0 16px;">Booking Cancelled</h2>
          <p style="color: #475569; margin: 8px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Refund:</strong> ₹${data.refundAmount}</p>
          <p style="color: #475569; margin: 8px 0;">Refund will be processed in 3-5 business days.</p>
        </div>
      </div>
    `;
    await this.sendMail(to, `Booking Cancelled - ${data.bookingId}`, html);
  }

  async sendPaymentReceipt(
    to: string,
    data: { bookingId: string; amount: number; paymentId: string; date: string },
  ) {
    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #1E40AF; font-size: 24px; margin: 0;">Safar</h1>
        </div>
        <div style="background: #ECFDF5; border-radius: 12px; padding: 24px; border: 1px solid #D1FAE5;">
          <h2 style="color: #059669; font-size: 20px; margin: 0 0 16px;">Payment Receipt</h2>
          <p style="color: #475569; margin: 8px 0;"><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Amount:</strong> ₹${data.amount}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Payment ID:</strong> ${data.paymentId}</p>
          <p style="color: #475569; margin: 8px 0;"><strong>Date:</strong> ${data.date}</p>
        </div>
      </div>
    `;
    await this.sendMail(to, `Payment Receipt - ${data.bookingId}`, html);
  }
}
