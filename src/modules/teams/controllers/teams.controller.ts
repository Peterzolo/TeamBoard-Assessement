import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { TeamsService } from '../services/teams.service';
import { CreateTeamDto } from '../dto/create-team.dto';
import { UpdateTeamDto } from '../dto/update-team.dto';
import {
  toPaginatedTeamResponse,
  toTeamResponse,
  toTeamResponseList,
} from '../presenters/team.presenter';
import { QueryTeamDto } from '../dto/query-team.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import {
  CurrentUser,
  CurrentUser as CurrentUserType,
} from '../../auth/decorators/current-user.decorator';
import { UserRole } from '../../users/entities/user.entity';
import { ForbiddenException } from '@nestjs/common';

@Controller('teams')
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      transform: true,
    }),
  )
  create(@Body() dto: CreateTeamDto, @CurrentUser() user: CurrentUserType) {
    return this.teamsService.create(dto, user).then(toTeamResponse);
  }

  @Get()
  findAll(@Query() query: QueryTeamDto) {
    return this.teamsService
      .findAllWithPagination(query)
      .then(toPaginatedTeamResponse);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id).then(toTeamResponse);
  }

  @Put(':id')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: true,
      transform: true,
    }),
  )
  update(@Param('id') id: string, @Body() dto: UpdateTeamDto) {
    return this.teamsService.update(id, dto).then(toTeamResponse);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.teamsService.softDelete(id);
  }
}
