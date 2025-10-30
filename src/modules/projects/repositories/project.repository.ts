import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BaseRepository } from '../../../core/repositories/base.repository';
import { Project, ProjectDocument } from '../entities/project.entity';

@Injectable()
export class ProjectRepository extends BaseRepository<
  ProjectDocument,
  Project
> {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {
    super(projectModel);
  }
}
