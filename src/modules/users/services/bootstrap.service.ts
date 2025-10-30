import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from './users.service';

import { UserRole } from '../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../../../core/services/email.service';
import { adminCredentialsTemplate } from '../../../core/templates/email/auth-templates';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
  ) {}

  async onModuleInit() {
    const superAdminEmail = 'petersolomon704@gmail.com';
    const existing = await this.usersService.findOne({
      email: superAdminEmail,
    });
    if (existing) {
      this.logger.log('Super admin already exists. Skipping creation.');
      return;
    }
    const password = UsersService.generateSecurePassword(12);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      firstName: 'Super',
      lastName: 'Admin',
      email: superAdminEmail,
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
    });

    console.log('Super admin created:', user);
    const template = adminCredentialsTemplate({
      userEmail: superAdminEmail,
      password,
    });
    await this.emailService.sendEmail(superAdminEmail, template);
    this.logger.log('Super admin account created and credentials sent.');
  }
}
