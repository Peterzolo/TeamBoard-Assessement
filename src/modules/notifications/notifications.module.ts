import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsController } from './controllers/notifications.controller';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationService } from './services/notification.service';
import { NotificationTemplateSeeder } from './scripts/seed-notification-templates';
import {
  Notification,
  NotificationSchema,
} from './entities/notification.entity';
import {
  NotificationTemplate,
  NotificationTemplateSchema,
} from './entities/notification-template.entity';
import {
  NotificationPreference,
  NotificationPreferenceSchema,
} from './entities/notification-preference.entity';
import { CoreModule } from '../../core/core.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
      { name: NotificationTemplate.name, schema: NotificationTemplateSchema },
      {
        name: NotificationPreference.name,
        schema: NotificationPreferenceSchema,
      },
    ]),
    UsersModule, // Import to use IUserLookupService
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
    CoreModule, // For EmailService
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationTemplateSeeder,
    {
      provide: 'NotificationService',
      useExisting: NotificationService,
    },
  ],
  exports: [
    NotificationService,
    NotificationGateway,
  ],
})
export class NotificationsModule {}
