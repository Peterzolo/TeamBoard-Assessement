import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from '../../../core/services/email.service';
import { BaseEmailTemplate } from '../../../core/templates/email';
import {
  emailVerificationTemplate,
  passwordResetTemplate,
  adminCredentialsTemplate,
  EmailVerificationData,
  PasswordResetData,
  AdminCredentialsData,
} from '../../../core/templates/email/auth-templates';

@Injectable()
export class AuthEmailService {
  private readonly logger = new Logger(AuthEmailService.name);

  constructor(private readonly emailService: EmailService) {}

  private async deliverEmailToUser(
    to: string,
    template: BaseEmailTemplate,
  ): Promise<boolean> {
    try {
      const success = await this.emailService.sendEmail(to, template);
      if (success) {
        this.logger.log(`Auth email sent to ${to}`);
      } else {
        this.logger.warn(
          `Failed to send auth email to ${to} - email service returned false`,
        );
      }
      return success;
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.stack || error.message;
      } else {
        errorMessage = JSON.stringify(error);
      }
      this.logger.error(`Failed to send auth email to ${to}`, errorMessage);
      return false;
    }
  }

  async sendEmailVerificationLink(
    userEmail: string,
    verificationLink: string,
  ): Promise<boolean> {
    const template = emailVerificationTemplate({
      verificationLink,
      userEmail,
    });

    return await this.deliverEmailToUser(userEmail, template);
  }

  async sendPasswordResetLink(
    userEmail: string,
    resetLink: string,
  ): Promise<boolean> {
    const template = passwordResetTemplate({
      resetLink,
      userEmail,
    });

    return await this.deliverEmailToUser(userEmail, template);
  }

  async sendAdminAccountCredentials(
    userEmail: string,
    password: string,
  ): Promise<boolean> {
    const template = adminCredentialsTemplate({
      userEmail,
      password,
    });

    return await this.deliverEmailToUser(userEmail, template);
  }
}
