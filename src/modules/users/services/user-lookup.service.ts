import { Injectable } from '@nestjs/common';
import { IUserLookupService } from '../../../core/interfaces/user-lookup.interface';
import { UserDocument } from '../entities/user.entity';
import { UsersService } from './users.service';

/**
 * Implementation of IUserLookupService using UsersService
 * In monolith: delegates to UsersService
 * In microservices: can be replaced with HTTP client implementation
 */
@Injectable()
export class UserLookupService implements IUserLookupService {
  constructor(private readonly usersService: UsersService) {}

  async findUserForLogin(email: string): Promise<UserDocument | null> {
    return await this.usersService.findUserForLogin(email);
  }

  async findUserWithEmailVerificationToken(
    email: string,
  ): Promise<UserDocument | null> {
    return await this.usersService.findUserWithEmailVerificationToken(email);
  }

  async findUserByIdWithResetToken(id: string): Promise<UserDocument | null> {
    return await this.usersService.findUserByIdWithResetToken(id);
  }

  async findUserById(id: string): Promise<UserDocument | null> {
    return await this.usersService.findById(id);
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return await this.usersService.findOne({ email });
  }

  async updateEmailVerificationToken(
    email: string,
    token: string,
  ): Promise<UserDocument | null> {
    return await this.usersService.updateEmailVerificationToken(email, token);
  }

  async getCurrentUser(id: string): Promise<UserDocument | null> {
    return await this.usersService.findById(id);
  }

  async findUsersByRole(roles: string[]): Promise<UserDocument[]> {
    // Use findAll to get users by role, then filter
    const allUsers = await this.usersService.findAll({});
    return allUsers.filter((user) => roles.includes(user.role));
  }

  async getUserEmailById(id: string): Promise<string | null> {
    const user = await this.usersService.findById(id);
    return user?.email || null;
  }
}
