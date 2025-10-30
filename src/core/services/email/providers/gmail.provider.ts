import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { BaseEmailTemplate } from '../../../templates/email';
import { BaseEmailProvider } from './base-email-provider';
import {
  EmailProviderConfig,
  EmailSendResult,
} from '../interfaces/email-provider.interface';

export interface GmailConfig extends EmailProviderConfig {
  user: string;
  pass: string;
  from?: string;
}

@Injectable()
export class GmailProvider extends BaseEmailProvider {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(config: GmailConfig): Promise<void> {
    try {
      const { user, pass } = config;

      if (!user || !pass) {
        throw new Error(
          'Gmail configuration is incomplete. Required: user, pass',
        );
      }

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });

      // Verify the connection
      await this.transporter.verify();

      this.config = config;
      this.isInitialized = true;
      this.logger.log('Gmail provider initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize Gmail provider: ${errorMessage}`);
      throw error;
    }
  }

  async sendEmail(
    to: string,
    template: BaseEmailTemplate,
    from?: string,
  ): Promise<EmailSendResult> {
    if (!this.isInitialized || !this.transporter) {
      return this.createErrorResult('Gmail provider not initialized');
    }

    if (!this.validateEmail(to)) {
      return this.createErrorResult(`Invalid email address: ${to}`);
    }

    try {
      const mailOptions = {
        from:
          from || this.config.from || this.config.user || 'no-reply@gmail.com',
        to,
        subject: template.subject,
        html: template.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent via Gmail to ${to}. Message ID: ${info.messageId}`,
      );

      return this.createSuccessResult(info.messageId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send email via Gmail to ${to}: ${errorMessage}`,
      );
      return this.createErrorResult(errorMessage);
    }
  }

  getProviderName(): string {
    return 'gmail';
  }
}
