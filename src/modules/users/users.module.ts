import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User, UserSchema } from './entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { UsersService } from './services/users.service';
import { UserRepository } from './repositories/user.repository';
import { BootstrapService } from './services/bootstrap.service';
import { UserLookupService } from './services/user-lookup.service';
import { CoreModule } from 'src/core/core.module';
import { IUserLookupService } from '../../core/interfaces/user-lookup.interface';

@Module({
  imports: [
    CoreModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserRepository,
    BootstrapService,
    UserLookupService,
    {
      provide: 'IUserLookupService',
      useExisting: UserLookupService,
    },
  ],
  exports: [UsersService, 'IUserLookupService'],
  // Ensure CoreModule is imported to use EmailService
})
export class UsersModule {}
