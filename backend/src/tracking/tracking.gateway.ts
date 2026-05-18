import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import { TrackingService, LocationUpdate } from './tracking.service';
import { BookingsService } from '../bookings/bookings.service';
import { NotificationsService } from '../notifications/notifications.service';
import { BookingStatus } from '../schemas/booking.schema';

interface AuthSocket extends Socket {
  userId?: string;
  userRole?: string;
  userName?: string;
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/tracking',
})
export class TrackingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TrackingGateway.name);
  private jwtSecret: string;

  constructor(
    private trackingService: TrackingService,
    private bookingsService: BookingsService,
    private notificationsService: NotificationsService,
    private configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'books-jwt-secret-change-in-prod',
    );
  }

  async handleConnection(client: AuthSocket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(token, this.jwtSecret) as {
        sub: string;
        role: string;
        name?: string;
      };

      client.userId = payload.sub;
      client.userRole = payload.role;
      client.userName = payload.name;

      this.logger.log(`Client connected: ${client.userId} (${client.userRole})`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      this.logger.log(`Client disconnected: ${client.userId}`);
    }
  }

  // Driver joins their active booking rooms
  @SubscribeMessage('driver:join')
  async handleDriverJoin(@ConnectedSocket() client: AuthSocket) {
    if (client.userRole !== 'driver') return;

    const bookings = await this.trackingService.getActiveBookingsForDriver(
      client.userId!,
    );
    for (const booking of bookings) {
      client.join(`booking:${booking._id}`);
      this.logger.log(
        `Driver ${client.userId} joined room booking:${booking._id}`,
      );
    }

    return { bookings };
  }

  // Customer joins their booking room
  @SubscribeMessage('customer:join')
  async handleCustomerJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { bookingId: string },
  ) {
    if (!data?.bookingId) return;

    client.join(`booking:${data.bookingId}`);
    this.logger.log(
      `Customer ${client.userId} joined room booking:${data.bookingId}`,
    );

    // Send current position if available
    const position = this.trackingService.getLivePosition(data.bookingId);
    if (position) {
      client.emit('location:update', {
        bookingId: data.bookingId,
        ...position,
      });
    }
  }

  // Admin joins all active rides
  @SubscribeMessage('admin:join')
  async handleAdminJoin(@ConnectedSocket() client: AuthSocket) {
    if (client.userRole !== 'admin') return;

    client.join('admin:live');
    const positions = this.trackingService.getAllLivePositions();
    client.emit('admin:positions', positions);
  }

  // Driver sends location update
  @SubscribeMessage('location:send')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    data: {
      bookingId: string;
      latitude: number;
      longitude: number;
      speed?: number;
      heading?: number;
      accuracy?: number;
    },
  ) {
    if (client.userRole !== 'driver' || !data?.bookingId) return;

    const update: LocationUpdate = {
      bookingId: data.bookingId,
      driverId: client.userId!,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed,
      heading: data.heading,
      accuracy: data.accuracy,
    };

    // Save and broadcast
    await this.trackingService.saveLocation(update);

    // Broadcast to booking room (customer watching)
    this.server.to(`booking:${data.bookingId}`).emit('location:update', {
      bookingId: data.bookingId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
      heading: data.heading || 0,
      updatedAt: new Date().toISOString(),
    });

    // Broadcast to admin live view
    this.server.to('admin:live').emit('admin:location', {
      bookingId: data.bookingId,
      latitude: data.latitude,
      longitude: data.longitude,
      speed: data.speed || 0,
    });
  }

  // Driver updates ride status via WebSocket
  @SubscribeMessage('status:update')
  async handleStatusUpdate(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { bookingId: string; status: string },
  ) {
    if (client.userRole !== 'driver' || !data?.bookingId || !data?.status)
      return;

    try {
      const booking = await this.bookingsService.updateStatus(
        data.bookingId,
        data.status as BookingStatus,
      );

      // Broadcast status change to booking room
      this.server.to(`booking:${data.bookingId}`).emit('status:changed', {
        bookingId: data.bookingId,
        status: data.status,
        updatedAt: new Date().toISOString(),
      });

      // Clean up on completion
      if (data.status === 'completed') {
        this.trackingService.removeLivePosition(data.bookingId);
      }

      return { success: true, booking };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  // Driver marks a stop as reached
  @SubscribeMessage('stop:reached')
  async handleStopReached(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() data: { bookingId: string; stopOrder: number },
  ) {
    if (client.userRole !== 'driver' || !data?.bookingId) return;

    try {
      const booking = await this.bookingsService.markStopReached(
        data.bookingId,
        data.stopOrder,
      );

      this.server.to(`booking:${data.bookingId}`).emit('stop:reached', {
        bookingId: data.bookingId,
        stopOrder: data.stopOrder,
        updatedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}
