import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Team, TeamDocument } from '../entities/team.entity';

@Injectable()
export class TeamRepository extends BaseRepository<TeamDocument, Team> {
  constructor(
    @InjectModel(Team.name) private readonly teamModel: Model<TeamDocument>,
  ) {
    super(teamModel);
  }
}
