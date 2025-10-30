import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TeamsController } from './controllers/teams.controller';
import { TeamsService } from './services/teams.service';
import { Team, TeamSchema } from './entities/team.entity';
import { TeamRepository } from './repositories/team.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Team.name, schema: TeamSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TeamsController],
  providers: [TeamsService, TeamRepository],
  exports: [],
})
export class TeamsModule {}
