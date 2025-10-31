import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { WinstonModule } from 'nest-winston';
import { winstonLoggerOptions } from './core/logger/winston-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  // CORS Configuration
  const isProd = process.env.NODE_ENV === 'production';
  const allowedOrigins = isProd
    ? process.env.ALLOWED_ORIGINS_PRODUCTION?.split(',') || [
        'https://teamboard-application',
      ]
    : process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // Important for cookies and authentication headers
    maxAge: 86400, // 24 hours - browser can cache CORS response
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: false, // Changed to false to allow all properties
      transform: true,
      forbidNonWhitelisted: false, // Changed to false to allow unknown properties
      skipMissingProperties: true,
      skipUndefinedProperties: true,
    }),
  );

  app.use(cookieParser());

  app.useGlobalFilters(new AllExceptionsFilter());

  // API versioning/global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  const appUrl = await app.getUrl();
  Logger.log(`
  ////////////////////////////////////////////
    Application is running at ${appUrl}/api/v1
  ////////////////////////////////////////////`);
}
void bootstrap();
