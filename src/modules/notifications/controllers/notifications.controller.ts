import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { NotificationService } from '../services/notification.service';
import {
  CreateNotificationDto,
  CreateBulkNotificationDto,
} from '../dto/create-notification.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '../entities/notification.entity';

@Controller('notifications')
@UseGuards(AuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  async createNotification(
    @Body() createNotificationDto: CreateNotificationDto,
    @CurrentUser('_id') userId: string,
  ) {
    // Set sender ID from authenticated user
    createNotificationDto.senderId = userId;

    return this.notificationService.createNotification(createNotificationDto);
  }

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  getAllNotifications(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('type') type?: NotificationType,
    @Query('channel') channel?: NotificationChannel,
    @Query('status') status?: NotificationStatus,
    @Query('recipientId') recipientId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.notificationService.getAllNotifications({
      page: page || 1,
      limit: limit || 50,
      type,
      channel,
      status,
      recipientId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Post('bulk')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  async createBulkNotifications(
    @Body() createBulkNotificationDto: CreateBulkNotificationDto,
    @CurrentUser('_id') userId: string,
  ) {
    // Set sender ID from authenticated user
    createBulkNotificationDto.senderId = userId;

    return this.notificationService.createBulkNotifications(
      createBulkNotificationDto,
    );
  }

  @Get('my-notifications')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  async getMyNotifications(
    @CurrentUser('_id') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.notificationService.getUserNotifications(
      userId,
      limit || 50,
      offset || 0,
    );
  }

  @Get('unread-count')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  async getUnreadCount(@CurrentUser('_id') userId: string) {
    const count = await this.notificationService.getUnreadCount(userId);
    return { unreadCount: count };
  }

  @Get(':id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  getNotificationById(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    return this.notificationService.getNotificationById(id, userId, userRole);
  }

  @Post(':id/read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser('_id') userId: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.notificationService.markAsRead(id, userId, userRole);
    return { message: 'Notification marked as read' };
  }
  // comment
  @Post('mark-all-read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.TEAM_MEMBER,
    UserRole.TEAM_LEAD,
  )
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@CurrentUser('_id') userId: string) {
    const result = await this.notificationService.markAllAsRead(userId);
    return {
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount,
    };
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser('role') userRole: string,
  ) {
    await this.notificationService.deleteNotification(id, userRole);
    return { message: 'Notification deleted successfully' };
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  getNotificationStats(@CurrentUser('_id') userId: string) {
    return this.notificationService.getNotificationStats();
  }
}
