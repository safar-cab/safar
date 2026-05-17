import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
} from '../schemas/payment.schema';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from '../schemas/booking.schema';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private razorpay: any;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private configService: ConfigService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Razorpay = require('razorpay');
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>(
        'RAZORPAY_KEY_ID',
        'rzp_test_placeholder',
      ),
      key_secret: this.configService.get<string>(
        'RAZORPAY_KEY_SECRET',
        'placeholder_secret',
      ),
    });
  }

  async createOrder(userId: string, bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.user.toString() !== userId.toString())
      throw new BadRequestException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Booking already processed');
    }

    const amountInPaise = Math.round(booking.pricing.totalAmount * 100);

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: booking.bookingId,
      payment_capture: 1,
      notes: {
        bookingId: booking.bookingId,
        userId: userId,
      },
    });

    const payment = await this.paymentModel.create({
      booking: bookingId,
      user: userId,
      razorpay: { orderId: order.id },
      amount: amountInPaise,
      currency: 'INR',
      method: 'upi',
      status: PaymentStatus.CREATED,
    });

    this.logger.log(
      `Payment order created: ${order.id} for booking ${booking.bookingId}`,
    );

    return {
      orderId: order.id,
      amount: amountInPaise,
      currency: 'INR',
      bookingId: booking.bookingId,
      keyId: this.configService.get<string>(
        'RAZORPAY_KEY_ID',
        'rzp_test_placeholder',
      ),
    };
  }

  async verifyPayment(dto: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    upiId?: string;
  }) {
    const secret = this.configService.get<string>(
      'RAZORPAY_KEY_SECRET',
      'placeholder_secret',
    );
    const body = dto.razorpayOrderId + '|' + dto.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== dto.razorpaySignature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const payment = await this.paymentModel.findOne({
      'razorpay.orderId': dto.razorpayOrderId,
    });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.razorpay.paymentId = dto.razorpayPaymentId;
    payment.razorpay.signature = dto.razorpaySignature;
    payment.status = PaymentStatus.CAPTURED;
    payment.paidAt = new Date();
    if (dto.upiId) payment.upiId = dto.upiId;
    await payment.save();

    // Confirm booking
    await this.bookingModel.findByIdAndUpdate(payment.booking, {
      status: BookingStatus.CONFIRMED,
    });

    this.logger.log(`Payment verified: ${dto.razorpayPaymentId}`);
    return { verified: true, paymentId: dto.razorpayPaymentId };
  }

  async initiateRefund(paymentId: string, amount?: number) {
    const payment = await this.paymentModel.findById(paymentId);
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.CAPTURED) {
      throw new BadRequestException('Payment not captured, cannot refund');
    }

    const refundAmount = amount || payment.amount;
    const refund = await this.razorpay.payments.refund(
      payment.razorpay.paymentId,
      {
        amount: refundAmount,
      },
    );

    payment.status =
      refundAmount === payment.amount
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIAL_REFUND;
    payment.refund = {
      refundId: refund.id,
      amount: refundAmount,
      status: 'initiated',
      processedAt: new Date(),
    };
    await payment.save();

    this.logger.log(`Refund initiated: ${refund.id} for payment ${paymentId}`);
    return payment;
  }

  async findByBooking(bookingId: string) {
    return this.paymentModel.findOne({ booking: bookingId }).lean();
  }

  async findByUser(userId: string, query: { page?: number; limit?: number }) {
    const { page = 1, limit = 20 } = query;
    const [payments, total] = await Promise.all([
      this.paymentModel
        .find({ user: userId })
        .populate('booking', 'bookingId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments({ user: userId }),
    ]);
    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findAll(query: { page?: number; limit?: number; status?: string }) {
    const { page = 1, limit = 20, status } = query;
    const filter: any = {};
    if (status) filter.status = status;

    const [payments, total] = await Promise.all([
      this.paymentModel
        .find(filter)
        .populate('booking', 'bookingId')
        .populate('user', 'name phone')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.paymentModel.countDocuments(filter),
    ]);
    return { payments, total, page, totalPages: Math.ceil(total / limit) };
  }

  async handleWebhook(body: any, signature: string) {
    const secret = this.configService.get<string>(
      'RAZORPAY_WEBHOOK_SECRET',
      'webhook_secret',
    );
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = body.event;
    const paymentEntity = body.payload?.payment?.entity;

    if (event === 'payment.captured' && paymentEntity) {
      const payment = await this.paymentModel.findOne({
        'razorpay.orderId': paymentEntity.order_id,
      });
      if (payment && payment.status !== PaymentStatus.CAPTURED) {
        payment.razorpay.paymentId = paymentEntity.id;
        payment.status = PaymentStatus.CAPTURED;
        payment.paidAt = new Date();
        await payment.save();

        await this.bookingModel.findByIdAndUpdate(payment.booking, {
          status: BookingStatus.CONFIRMED,
        });
        this.logger.log(`Webhook: Payment captured ${paymentEntity.id}`);
      }
    }

    return { status: 'ok' };
  }
}
