import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../services/notification.service';
import {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn('Client connected without token');
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      // Store user info in socket
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Map user to socket
      this.connectedUsers.set(payload.sub, client.id);

      // Join user to their personal room
      await client.join(`user:${payload.sub}`);

      // Join user to role-based rooms
      if (payload.role) {
        await client.join(`role:${payload.role}`);
      }

      this.logger.log(`User ${payload.sub} connected with socket ${client.id}`);

      // Send connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to notification service',
        userId: payload.sub,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        'Authentication failed:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`User ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    await client.join(data.room);
    client.emit('joined_room', { room: data.room });
    this.logger.log(`User ${client.userId} joined room ${data.room}`);
  }

  @SubscribeMessage('leave_room')
  async handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    if (!client.userId) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    await client.leave(data.room);
    client.emit('left_room', { room: data.room });
    this.logger.log(`User ${client.userId} left room ${data.room}`);
  }

  @SubscribeMessage('mark_notification_read')
  async handleMarkNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.userId || !client.userRole) {
      client.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      await this.notificationService.markAsRead(
        data.notificationId,
        client.userId,
        client.userRole,
      );
      client.emit('notification_read', { notificationId: data.notificationId });
    } catch (error) {
      this.logger.error(
        'Failed to mark notification as read:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      client.emit('error', { message: 'Failed to mark notification as read' });
    }
  }

  // Method to send notification to specific user
  sendToUser(userId: string, notification: any) {
    const socketId = this.connectedUsers.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId}`);
    } else {
      this.logger.warn(`User ${userId} is not connected`);
    }
  }

  // Method to send notification to all users in a room
  sendToRoom(room: string, notification: any) {
    this.server.to(room).emit('notification', notification);
    this.logger.log(`Notification sent to room ${room}`);
  }

  // Method to send notification to all connected users
  sendToAll(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification sent to all connected users');
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }
}
