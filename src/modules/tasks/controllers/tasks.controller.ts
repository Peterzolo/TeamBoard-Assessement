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
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { QueryTaskDto } from '../dto/query-task.dto';
import {
  toPaginatedTaskResponse,
  toTaskResponse,
} from '../presenters/task.presenter';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';
import {
  CurrentUser,
  CurrentUser as CurrentUserType,
} from '../../auth/decorators/current-user.decorator';
import { AddReviewDto } from '../dto/add-review.dto';
import { ModifyAssigneesDto } from '../dto/modify-assignees.dto';
import { ChangeStatusDto } from '../dto/change-status.dto';
import { ChangePriorityDto } from '../dto/change-priority.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

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
  create(@Body() dto: CreateTaskDto, @CurrentUser() user: CurrentUserType) {
    return this.tasksService.create(dto, user).then(toTaskResponse);
  }

  @Get()
  findAll(@Query() query: QueryTaskDto) {
    return this.tasksService
      .findAllWithPagination(query)
      .then(toPaginatedTaskResponse);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id).then(toTaskResponse);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.tasksService.update(id, dto).then(toTaskResponse);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PROJECT_MANAGER)
  remove(@Param('id') id: string) {
    return this.tasksService.softDelete(id);
  }

  @Post(':id/reviews')
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
  addReview(
    @Param('id') id: string,
    @Body() dto: AddReviewDto,
    @CurrentUser() reviewer: CurrentUserType,
  ) {
    return this.tasksService.addReview(id, dto, reviewer).then(toTaskResponse);
  }

  @Post(':id/assignees')
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
  addAssignees(@Param('id') id: string, @Body() dto: ModifyAssigneesDto) {
    return this.tasksService.addAssignees(id, dto).then(toTaskResponse);
  }

  @Delete(':id/assignees')
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
  removeAssignees(@Param('id') id: string, @Body() dto: ModifyAssigneesDto) {
    return this.tasksService.removeAssignees(id, dto).then(toTaskResponse);
  }

  @Post(':id/status')
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
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto) {
    return this.tasksService.changeStatus(id, dto).then(toTaskResponse);
  }

  @Post(':id/priority')
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
  changePriority(@Param('id') id: string, @Body() dto: ChangePriorityDto) {
    return this.tasksService.changePriority(id, dto).then(toTaskResponse);
  }
}
