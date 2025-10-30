import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          Logger.error(
            'MONGODB_URI is not defined in the environment variables.',
            'DatabaseModule',
          );
        } else {
          // Log only a non-sensitive part of the URI for verification
          Logger.log(`Attempting to connect to database...`, 'DatabaseModule');
        }
        return {
          uri,
          connectionFactory: (connection) => {
            // By the time this factory executes, the connection might already be established.
            // A readyState of 1 indicates a successful connection.
            if (connection.readyState === 1) {
              Logger.log('Database connected successfully', 'Mongoose');
            }
            connection.on('disconnected', () => {
              Logger.log('Database disconnected', 'Mongoose');
            });
            connection.on('error', (error) => {
              Logger.error(`Database connection error: ${error}`, 'Mongoose');
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
