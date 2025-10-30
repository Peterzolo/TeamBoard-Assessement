import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TeamsModule } from './modules/teams/teams.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { HealthController } from './core/controllers/health.controller';
import { MemoryManagerService } from './core/services/memory-manager.service';
import { MemoryMonitorService } from './core/services/memory-monitor.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-system',
    ),
    ScheduleModule.forRoot(),
    NotificationsModule,
    AuthModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
  ],
  controllers: [HealthController],
  providers: [MemoryManagerService, MemoryMonitorService],
})
export class AppModule {}
