import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoreModule } from '../../core/core.module';
import { AuthEmailService } from './services/auth-email.service';
import { AuthGuard } from './guards/auth.guard';
import { GlobalAuthGuard } from './guards/global-auth.guard';
import { AutoRefreshMiddleware } from './middleware/auto-refresh.middleware';
import { TokenExtractorService } from './services/token-extractor.service';
import { AuthErrorHandlerService } from './services/auth-error-handler.service';

@Module({
  imports: [
    UsersModule,
    CoreModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        console.log('JWT Configuration:', {
          secret: secret ? 'Set' : 'Not Set',
          expiresIn: '24h',
        });

        return {
          secret: secret,
          signOptions: { expiresIn: '24h' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [
    AuthService,
    AuthEmailService,
    AuthGuard,
    GlobalAuthGuard,
    AutoRefreshMiddleware,
    TokenExtractorService,
    AuthErrorHandlerService,
  ],
  controllers: [AuthController],
  exports: [
    AuthGuard,
    GlobalAuthGuard,
    AutoRefreshMiddleware,
    TokenExtractorService,
    AuthErrorHandlerService,
    JwtModule,
  ],
})
export class AuthModule {}
