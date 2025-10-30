import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { UpdateQuery } from 'mongoose';
import { User, UserDocument } from '../entities/user.entity';
import { UsersService } from '../services/users.service';
import { InviteUserDto } from '../dto/UserSignUp.dto';
import { CompleteProfileRequestDto } from '../dto/complete-profile.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { UserRole } from '../entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAllWithPagination(queryDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  update(@Param('id') id: string, @Body() data: UpdateQuery<UserDocument>) {
    return this.usersService.update(id, data);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  delete(@Param('id') id: string) {
    return this.usersService.delete(id);
  }

  // Endpoint for super admin to invite a user
  @Post('invite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  async inviteUser(
    @CurrentUser() currentUser: UserDocument,
    @Body() inviteUserDto: InviteUserDto,
  ) {
    console.log('Inviting user CONTROLLER:', currentUser);
    const { user, emailVerificationToken } =
      await this.usersService.createInvitedUser(inviteUserDto, currentUser);
    return {
      user,
      emailVerificationToken, // For testing only
      message: 'User invited. Token included for testing only!',
    };
  }

  // Endpoint for user to complete their profile after email verification
  @Post('complete-profile')
  async completeProfile(@Body() body: CompleteProfileRequestDto) {
    console.log(
      '🎯 [PUBLIC_ENDPOINT] completeProfile accessed WITHOUT authentication!',
    );

    return this.usersService.completeUserProfile(body);
  }
}
