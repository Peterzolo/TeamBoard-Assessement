import {
  Injectable,
  Logger,
  Inject,
  forwardRef,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  Notification,
  NotificationStatus,
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';
import { NotificationPreference } from '../entities/notification-preference.entity';
import {
  CreateNotificationDto,
  CreateBulkNotificationDto,
} from '../dto/create-notification.dto';
import { NotificationGateway } from '../gateways/notification.gateway';
import { EmailService } from '../../../core/services/email.service';
import { UserRole } from '../../users/entities/user.entity';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';
import { Inject } from '@nestjs/common';
import { UserDocument } from '../../users/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<Notification>,
    @InjectModel(NotificationPreference.name)
    private preferenceModel: Model<NotificationPreference>,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly notificationGateway: NotificationGateway,
    private readonly emailService: EmailService,
    @Inject('IUserLookupService')
    private readonly userLookupService: IUserLookupService,
  ) {}

  // Create a single notification
  async createNotification(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    try {
      this.logger.log('Creating notification:', {
        type: createNotificationDto.type,
        channel: createNotificationDto.channel,
        recipientId: createNotificationDto.recipientId,
        title: createNotificationDto.title,
      });

      const notification = new this.notificationModel({
        ...createNotificationDto,
        recipientId: new Types.ObjectId(createNotificationDto.recipientId),
        senderId: createNotificationDto.senderId
          ? new Types.ObjectId(createNotificationDto.senderId)
          : undefined,
        scheduledFor: createNotificationDto.scheduledFor
          ? new Date(createNotificationDto.scheduledFor)
          : undefined,
        expiresAt: createNotificationDto.expiresAt
          ? new Date(createNotificationDto.expiresAt)
          : undefined,
      });

      const savedNotification = await notification.save();
      this.logger.log('Notification saved to database:', savedNotification._id);

      // Send immediately if not scheduled
      if (!createNotificationDto.scheduledFor) {
        await this.sendNotification(savedNotification as any);
      }

      return savedNotification as any;
    } catch (error) {
      this.logger.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Create bulk notifications
  async createBulkNotifications(
    createBulkNotificationDto: CreateBulkNotificationDto,
  ): Promise<Notification[]> {
    try {
      const notifications = createBulkNotificationDto.recipientIds.map(
        (recipientId) => ({
          ...createBulkNotificationDto,
          recipientId: new Types.ObjectId(recipientId),
          senderId: createBulkNotificationDto.senderId
            ? new Types.ObjectId(createBulkNotificationDto.senderId)
            : undefined,
          scheduledFor: createBulkNotificationDto.scheduledFor
            ? new Date(createBulkNotificationDto.scheduledFor)
            : undefined,
          expiresAt: createBulkNotificationDto.expiresAt
            ? new Date(createBulkNotificationDto.expiresAt)
            : undefined,
        }),
      );

      const savedNotifications =
        await this.notificationModel.insertMany(notifications);

      // Send immediately if not scheduled
      if (!createBulkNotificationDto.scheduledFor) {
        for (const notification of savedNotifications) {
          await this.sendNotification(notification as any);
        }
      }

      return savedNotifications as any;
    } catch (error) {
      this.logger.error('Failed to create bulk notifications:', error);
      throw error;
    }
  }

  // Send notification through appropriate channel
  async sendNotification(notification: Notification): Promise<void> {
    try {
      // Check user preferences
      const preferences = await this.getUserPreferences(
        notification.recipientId.toString(),
      );
      if (
        !this.isNotificationEnabled(
          notification.type,
          notification.channel,
          preferences,
        )
      ) {
        this.logger.log(
          `Notification disabled for user ${notification.recipientId.toString()} - ${notification.type} via ${notification.channel}`,
        );
        return;
      }

      // Check if notification has expired
      if (notification.expiresAt && new Date() > notification.expiresAt) {
        this.logger.log(`Notification ${notification.id} has expired`);
        await this.updateNotificationStatus(
          notification.id.toString(),
          NotificationStatus.CANCELLED,
        );
        return;
      }

      // Send based on channel
      switch (notification.channel) {
        case NotificationChannel.IN_APP:
          this.sendInAppNotification(notification);
          break;
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(notification);
          break;
        default:
          this.logger.warn(
            `Unknown notification channel: ${String(notification.channel)}`,
          );
      }

      // Update notification status
      await this.updateNotificationStatus(
        notification.id.toString(),
        NotificationStatus.SENT,
      );
      notification.sentAt = new Date();
      await notification.save();
    } catch (error) {
      this.logger.error(`Failed to send notification ${notification.id}:`, {
        error: error.message || error,
        stack: error.stack,
        notificationId: notification._id,
        notificationType: notification.type,
        channel: notification.channel,
        recipientId: notification.recipientId,
      });
      await this.updateNotificationStatus(
        notification.id.toString(),
        NotificationStatus.FAILED,
        error.message || 'Unknown error',
      );
      notification.retryCount++;
      await notification.save();
    }
  }

  // Send in-app notification via WebSocket
  private sendInAppNotification(notification: Notification): void {
    try {
      this.notificationGateway.sendToUser(notification.recipientId.toString(), {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
        priority: notification.priority,
        timestamp: notification.createdAt,
      });

      this.logger.log(
        `In-app notification sent to user ${notification.recipientId.toString()}`,
      );
    } catch (error) {
      this.logger.error('Failed to send in-app notification:', error);
      throw error;
    }
  }

  // Send email notification
  private async sendEmailNotification(
    notification: Notification,
  ): Promise<void> {
    let userEmail: string | null = null;

    try {
      // Get user email (you'll need to fetch this from user service)
      userEmail = await this.getUserEmail(notification.recipientId.toString());

      if (!userEmail) {
        throw new Error('User email not found');
      }

      // Use basic template for notifications
      const emailTemplate = {
        subject: notification.title,
        html: notification.message,
      };

      await this.emailService.sendEmail(
        userEmail,
        emailTemplate,
        notification.recipientId.toString(),
        notification.type,
        notification.templateData,
      );

      this.logger.log(`Email notification sent to ${userEmail}`);
    } catch (error) {
      this.logger.error('Failed to send email notification:', {
        error: error.message || error,
        stack: error.stack,
        notificationId: notification._id,
        recipientId: notification.recipientId,
        notificationType: notification.type,
        userEmail: userEmail || 'unknown',
      });
      throw error;
    }
  }

  // Get user notifications
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<any[]> {
    this.logger.log(`Getting notifications for user: ${userId}`);

    const query = { recipientId: new Types.ObjectId(userId) };
    this.logger.log(`Query: ${JSON.stringify(query)}`);

    const notifications = await this.notificationModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .lean()
      .exec();

    // Add read status for each notification
    const notificationsWithReadStatus = notifications.map((notification) => ({
      ...notification,
      isRead: notification.status === NotificationStatus.READ,
      readBy: notification.readBy.map((id) => id.toString()), // Convert ObjectIds to strings for frontend
    }));

    this.logger.log(
      `Found ${notifications.length} notifications for user ${userId}`,
    );
    return notificationsWithReadStatus;
  }

  // Mark notification as read
  async markAsRead(
    notificationId: string,
    userId: string,
    userRole: string,
  ): Promise<void> {
    // First, get the notification to check access
    const notification = await this.notificationModel
      .findById(notificationId)
      .lean()
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Check if user has permission to mark this notification as read
    const isOwner = notification.recipientId.toString() === userId.toString();
    const isAdmin =
      userRole === 'CEO' || userRole === 'Super-admin' || userRole === 'Admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'Access denied. Only the notification owner or admin can mark as read',
      );
    }

    const result = await this.notificationModel.updateOne(
      {
        _id: new Types.ObjectId(notificationId),
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
        $set: {
          readAt: new Date(),
          status: NotificationStatus.READ,
        },
      },
    );

    if (result.matchedCount === 0) {
      throw new InternalServerErrorException('Failed to update notification');
    }

    this.logger.log(
      `Notification ${notificationId} marked as read by user ${userId} (${userRole})`,
    );
  }

  // Get unread notification count
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId: new Types.ObjectId(userId),
      status: { $ne: NotificationStatus.READ },
    });
  }

  // Check if notification is read by specific user
  async isNotificationReadByUser(
    notificationId: string,
    userId: string,
  ): Promise<boolean> {
    const notification = await this.notificationModel
      .findOne({
        _id: new Types.ObjectId(notificationId),
        recipientId: new Types.ObjectId(userId),
      })
      .select('readBy')
      .lean()
      .exec();

    if (!notification) {
      return false;
    }

    return notification.readBy.some(
      (readByUserId) => readByUserId.toString() === userId.toString(),
    );
  }

  // Update notification status
  private async updateNotificationStatus(
    notificationId: string,
    status: NotificationStatus,
    errorMessage?: string,
  ): Promise<void> {
    await this.notificationModel.updateOne(
      { _id: new Types.ObjectId(notificationId) },
      {
        status,
        ...(errorMessage && { errorMessage }),
        ...(status === NotificationStatus.SENT && { sentAt: new Date() }),
        ...(status === NotificationStatus.DELIVERED && {
          deliveredAt: new Date(),
        }),
      },
    );
  }

  // Get user preferences
  private async getUserPreferences(
    userId: string,
  ): Promise<NotificationPreference | null> {
    return this.preferenceModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();
  }

  // Check if notification is enabled for user
  private isNotificationEnabled(
    type: NotificationType,
    channel: NotificationChannel,
    preferences: NotificationPreference | null,
  ): boolean {
    if (!preferences) return true; // Default to enabled if no preferences

    switch (channel) {
      case NotificationChannel.EMAIL:
        return (
          preferences.emailEnabled &&
          preferences.emailPreferences.get(type) !== false
        );
      case NotificationChannel.IN_APP:
        return (
          preferences.inAppEnabled &&
          preferences.inAppPreferences.get(type) !== false
        );
      default:
        return true;
    }
  }

  // Placeholder methods - you'll need to implement these based on your user service
  private async getUserEmail(userId: string): Promise<string | null> {
    try {
      return await this.userLookupService.getUserEmailById(userId);
    } catch (error) {
      this.logger.error(`Failed to get user email for ${userId}:`, error);
      return null;
    }
  }

  private async getUsersByRole(roles: string[]): Promise<any[]> {
    try {
      return await this.userLookupService.findUsersByRole(roles);
    } catch (error) {
      this.logger.error('Failed to get users by role:', error);
      return [];
    }
  }

  // Cron job to process scheduled notifications
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledNotifications(): Promise<void> {
    const now = new Date();
    const scheduledNotifications = await this.notificationModel
      .find({
        status: NotificationStatus.PENDING,
        scheduledFor: { $lte: now },
      })
      .exec();

    for (const notification of scheduledNotifications) {
      await this.sendNotification(notification);
    }
  }

  // Cron job to clean up expired notifications
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    await this.notificationModel.updateMany(
      {
        expiresAt: { $lt: now },
        status: { $in: [NotificationStatus.PENDING, NotificationStatus.SENT] },
      },
      { status: NotificationStatus.CANCELLED },
    );
  }

  /**
   * Get all notifications with filtering and pagination (Super Admin only)
   */
  async getAllNotifications(filters: {
    page: number;
    limit: number;
    type?: NotificationType;
    channel?: NotificationChannel;
    status?: NotificationStatus;
    recipientId?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const {
      page,
      limit,
      type,
      channel,
      status,
      recipientId,
      startDate,
      endDate,
    } = filters;

    // Build filter query
    const filterQuery: any = {};

    if (type) filterQuery.type = type;
    if (channel) filterQuery.channel = channel;
    if (status) filterQuery.status = status;
    if (recipientId) filterQuery.recipientId = new Types.ObjectId(recipientId);

    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) filterQuery.createdAt.$gte = startDate;
      if (endDate) filterQuery.createdAt.$lte = endDate;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get notifications with pagination
    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(filterQuery)
        .populate('recipientId', 'firstName lastName email')
        .populate('senderId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.notificationModel.countDocuments(filterQuery).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        type,
        channel,
        status,
        recipientId,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
      },
    };
  }

  /**
   * Get notification by ID with access control
   */
  async getNotificationById(
    notificationId: string,
    userId: string,
    userRole: string,
  ) {
    this.logger.log(
      `Getting notification ${notificationId} for user ${userId} with role ${userRole}`,
    );

    // Debug: Log the user role check
    this.logger.log(
      `User role check: ${userRole} === 'SUPER_ADMIN' ? ${userRole === 'SUPER_ADMIN'}`,
    );

    const notification = await this.notificationModel
      .findById(notificationId)
      .populate('recipientId', 'firstName lastName email')
      .populate('senderId', 'firstName lastName email')
      .lean()
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    // Super admin can view any notification
    if (userRole === 'CEO' || userRole === 'Super-admin') {
      this.logger.log(
        `Super admin access granted for notification ${notificationId}`,
      );

      // Add read status for the notification
      const notificationWithReadStatus = {
        ...notification,
        isRead: notification.status === NotificationStatus.READ,
        readBy: notification.readBy.map((id) => id.toString()), // Convert ObjectIds to strings for frontend
      };

      return notificationWithReadStatus;
    }

    // For regular users, check if they are the recipient
    let recipientId: string;

    if (
      typeof notification.recipientId === 'object' &&
      notification.recipientId !== null
    ) {
      // If populated, extract the _id from the populated object
      recipientId = (notification.recipientId as any)._id.toString();
    } else {
      // If not populated, it's already a string/ObjectId
      recipientId = notification.recipientId.toString();
    }

    this.logger.log(
      `Comparing recipientId: ${recipientId} with userId: ${userId}`,
    );

    if (recipientId.toString() !== userId.toString()) {
      this.logger.warn(
        `Access denied for notification ${notificationId}. Recipient: ${recipientId}, User: ${userId}`,
      );
      throw new ForbiddenException('Access denied to this notification');
    }

    this.logger.log(`Access granted for notification ${notificationId}`);

    // Add read status for the notification
    const notificationWithReadStatus = {
      ...notification,
      isRead: notification.status === NotificationStatus.READ,
      readBy: notification.readBy.map((id) => id.toString()), // Convert ObjectIds to strings for frontend
    };

    return notificationWithReadStatus;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const result = await this.notificationModel.updateMany(
      {
        recipientId: new Types.ObjectId(userId),
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );

    return result;
  }

  /**
   * Delete notification (Super Admin only)
   */
  async deleteNotification(
    notificationId: string,
    userRole: string,
  ): Promise<void> {
    // Only super admin can delete notifications
    if (userRole !== 'Super-admin' && userRole !== 'CEO') {
      throw new ForbiddenException(
        'Access denied. Only Super Admin can delete notifications',
      );
    }

    const result = await this.notificationModel.deleteOne({
      _id: new Types.ObjectId(notificationId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Notification not found');
    }

    this.logger.log(`Notification ${notificationId} deleted by Super Admin`);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats() {
    const [
      totalNotifications,
      sentNotifications,
      pendingNotifications,
      failedNotifications,
      readNotifications,
      unreadNotifications,
      notificationsByType,
      notificationsByChannel,
      recentNotifications,
    ] = await Promise.all([
      this.notificationModel.countDocuments().exec(),
      this.notificationModel
        .countDocuments({ status: NotificationStatus.SENT })
        .exec(),
      this.notificationModel
        .countDocuments({ status: NotificationStatus.PENDING })
        .exec(),
      this.notificationModel
        .countDocuments({ status: NotificationStatus.FAILED })
        .exec(),
      this.notificationModel.countDocuments({ isRead: true }).exec(),
      this.notificationModel.countDocuments({ isRead: false }).exec(),
      this.notificationModel
        .aggregate([
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.notificationModel
        .aggregate([
          { $group: { _id: '$channel', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .exec(),
      this.notificationModel
        .find()
        .populate('recipientId', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
        .exec(),
    ]);

    return {
      overview: {
        totalNotifications,
        sentNotifications,
        pendingNotifications,
        failedNotifications,
        readNotifications,
        unreadNotifications,
        successRate:
          totalNotifications > 0
            ? ((sentNotifications / totalNotifications) * 100).toFixed(2)
            : '0.00',
      },
      breakdown: {
        byType: notificationsByType,
        byChannel: notificationsByChannel,
      },
      recent: recentNotifications,
      lastUpdated: new Date().toISOString(),
    };
  }
}
