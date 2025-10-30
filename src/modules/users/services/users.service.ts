import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { BaseService } from '../../../core/services/base.service';
import { User, UserDocument } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { InviteUserDto } from '../dto/UserSignUp.dto';
import { QueryUserDto } from '../dto/query-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../../../core/services/email.service';
import { Inject } from '@nestjs/common';
import { Queue } from 'bullmq';
import {
  emailVerificationTemplate,
  adminCredentialsTemplate,
} from '../../../core/templates/email/auth-templates';
import { UserRole } from '../entities/user.entity';
import { CompleteProfileRequestDto } from '../dto/complete-profile.dto';

@Injectable()
export class UsersService extends BaseService<UserDocument, User> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    @Inject('EMAIL_QUEUE') private readonly emailQueue: Queue,
  ) {
    super(userRepository);
  }

  async findUserForLogin(email: string): Promise<UserDocument | null> {
    return await this.userRepository.findUserForLogin(email);
  }

  async findUserWithEmailVerificationToken(
    email: string,
  ): Promise<UserDocument | null> {
    return await this.userRepository.findUserWithEmailVerificationToken(email);
  }

  async updateEmailVerificationToken(
    email: string,
    emailVerificationToken: string,
  ): Promise<UserDocument | null> {
    return await this.userRepository.updateEmailVerificationToken(
      email,
      emailVerificationToken,
    );
  }

  async findUserByIdWithResetToken(id: string): Promise<UserDocument | null> {
    return this.userRepository.findUserByIdWithResetToken(id);
  }

  async createInvitedUser(
    inviteDto: InviteUserDto,
    currentUser: UserDocument,
  ): Promise<{ user: UserDocument; emailVerificationToken: string }> {
    console.log('CURRENT USER ROLE', currentUser);
    if (currentUser.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Only Super Admin can invite users');
    }
    if (!inviteDto.role) {
      throw new BadRequestException('Role is required');
    }
    let user = await this.findOne({ email: inviteDto.email });
    const emailVerificationToken = this.jwtService.sign({
      email: inviteDto.email,
    });

    if (user) {
      if (user.isEmailVerified) {
        throw new BadRequestException(
          'User with this email already exists and is verified',
        );
      }
      // User exists but not verified: update token and resend email
      user.emailVerificationToken = emailVerificationToken;
      await user.save();
      const verificationLink = `http://localhost:3000/screens/auth/verify-email?token=${emailVerificationToken}`;
      const template = emailVerificationTemplate({
        verificationLink,
        userEmail: inviteDto.email,
      });
      await this.emailQueue.add(
        'send-email',
        {
          to: inviteDto.email,
          subject: template.subject,
          html: template.html,
          type: 'email_verification',
          data: { email: inviteDto.email },
        },
        { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
      );

      return { user, emailVerificationToken };
    }

    // User does not exist: create and send email
    user = await this.userRepository.create({
      email: inviteDto.email,
      role: inviteDto.role,
      isEmailVerified: false,
      emailVerificationToken,
    });
    const verificationLink = `http://localhost:3000/screens/auth/verify-email?token=${emailVerificationToken}`;
    const template = emailVerificationTemplate({
      verificationLink,
      userEmail: inviteDto.email,
    });
    await this.emailQueue.add(
      'send-email',
      {
        to: inviteDto.email,
        subject: template.subject,
        html: template.html,
        type: 'email_verification',
        data: { email: inviteDto.email },
      },
      { attempts: 5, backoff: { type: 'exponential', delay: 5000 } },
    );

    return { user, emailVerificationToken };
  }

  async completeUserProfile(
    body: CompleteProfileRequestDto,
  ): Promise<UserDocument> {
    let payload: any;
    try {
      payload = this.jwtService.verify(body.token);
    } catch {
      throw new UnauthorizedException('Invalid or expired verification token');
    }
    const user = await this.findOne({ email: payload.email });
    if (!user || !user.isEmailVerified) {
      throw new UnauthorizedException('User not found or not verified');
    }
    if (user.firstName && user.lastName && user.password) {
      throw new BadRequestException('Profile already completed');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    user.firstName = body.firstName;
    user.lastName = body.lastName;
    user.password = hashedPassword;
    user.emailVerificationToken = null;
    await user.save();
    return user;
  }

  async findAllWithPagination(queryDto: QueryUserDto): Promise<{
    message: string;
    data: UserDocument[];
    total: number;
    pagination: {
      page: number;
      totalPages: number;
    };
  }> {
    const {
      search,
      role,
      firstName,
      lastName,
      email,
      isEmailVerified,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryDto;

    // Build filters
    const filters: any = {};

    // Handle search across multiple fields
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      filters.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    // Handle role filtering
    if (role) {
      filters.role = role;
    }

    // Handle individual field filters (these will override search if both are provided)
    if (firstName && firstName.trim()) {
      filters.firstName = { $regex: firstName.trim(), $options: 'i' };
    }

    if (lastName && lastName.trim()) {
      filters.lastName = { $regex: lastName.trim(), $options: 'i' };
    }

    if (email && email.trim()) {
      filters.email = { $regex: email.trim(), $options: 'i' };
    }

    // Handle boolean filtering for email verification status
    if (isEmailVerified !== undefined && isEmailVerified !== null) {
      filters.isEmailVerified = isEmailVerified;
    }

    // Validate and set sort parameters
    const validSortFields = [
      'firstName',
      'lastName',
      'email',
      'role',
      'isEmailVerified',
      'createdAt',
      'updatedAt',
    ];
    const finalSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrderValue: 1 | -1 = sortOrder === 'asc' ? 1 : -1;
    const sort: Record<string, 1 | -1> = { [finalSortBy]: sortOrderValue };

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));

    const result = await this.userRepository.findWithPagination({
      filter: filters,
      page: pageNum,
      limit: limitNum,
      sort,
    });

    return {
      message: 'Users retrieved successfully',
      data: result.data,
      total: result.total,
      pagination: {
        page: result.page,
        totalPages: result.totalPages,
      },
    };
  }

  static generateSecurePassword(length = 12): string {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    const all = upper + lower + numbers + special;
    let password = '';
    password += upper[Math.floor(Math.random() * upper.length)];
    password += lower[Math.floor(Math.random() * lower.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < length; i++) {
      password += all[Math.floor(Math.random() * all.length)];
    }
    return password
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
  }
}
