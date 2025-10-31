import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { QueryProjectDto } from '../dto/query-project.dto';
import {
  toPaginatedProjectResponse,
  toProjectResponse,
} from '../presenters/project.presenter';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  CurrentUser,
  CurrentUser as CurrentUserType,
} from '../../auth/decorators/current-user.decorator';
import { ModifyMembersDto } from '../dto/modify-members.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      transform: true,
    }),
  )
  create(@Body() dto: CreateProjectDto, @CurrentUser() user: CurrentUserType) {
    return this.projectsService.create(dto, user).then(toProjectResponse);
  }

  @Get()
  findAll(@Query() query: QueryProjectDto) {
    return this.projectsService
      .findAllWithPagination(query)
      .then(toPaginatedProjectResponse);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id).then(toProjectResponse);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.projectsService.update(id, dto).then(toProjectResponse);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  remove(@Param('id') id: string) {
    return this.projectsService.softDelete(id);
  }

  @Post(':id/members')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      transform: true,
    }),
  )
  addMembers(@Param('id') id: string, @Body() dto: ModifyMembersDto) {
    return this.projectsService.addMembers(id, dto).then(toProjectResponse);
  }

  @Delete(':id/members')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      transform: true,
    }),
  )
  removeMembers(@Param('id') id: string, @Body() dto: ModifyMembersDto) {
    return this.projectsService.removeMembers(id, dto).then(toProjectResponse);
  }
}
