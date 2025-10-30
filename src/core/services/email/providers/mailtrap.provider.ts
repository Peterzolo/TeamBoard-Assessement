import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { BaseEmailTemplate } from '../../../templates/email';
import { BaseEmailProvider } from './base-email-provider';
import {
  EmailProviderConfig,
  EmailSendResult,
} from '../interfaces/email-provider.interface';

export interface MailtrapConfig extends EmailProviderConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
}

@Injectable()
export class MailtrapProvider extends BaseEmailProvider {
  private transporter: nodemailer.Transporter | null = null;

  async initialize(config: MailtrapConfig): Promise<void> {
    try {
      const { host, port, user, pass } = config;

      if (!host || !port || !user || !pass) {
        throw new Error(
          'Mailtrap configuration is incomplete. Required: host, port, user, pass',
        );
      }

      this.transporter = nodemailer.createTransport({
        host,
        port: Number(port),
        auth: {
          user,
          pass,
        },
      });

      // Verify the connection
      await this.transporter.verify();

      this.config = config;
      this.isInitialized = true;
      this.logger.log('Mailtrap provider initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to initialize Mailtrap provider: ${errorMessage}`,
      );
      throw error;
    }
  }

  async sendEmail(
    to: string,
    template: BaseEmailTemplate,
    from?: string,
  ): Promise<EmailSendResult> {
    if (!this.isInitialized || !this.transporter) {
      return this.createErrorResult('Mailtrap provider not initialized');
    }

    if (!this.validateEmail(to)) {
      return this.createErrorResult(`Invalid email address: ${to}`);
    }

    try {
      const mailOptions = {
        from: from || this.config.from || 'no-reply@bestpracticesltd.com',
        to,
        subject: template.subject,
        html: template.html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent via Mailtrap to ${to}. Message ID: ${info.messageId}`,
      );

      return this.createSuccessResult(info.messageId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send email via Mailtrap to ${to}: ${errorMessage}`,
      );
      return this.createErrorResult(errorMessage);
    }
  }

  getProviderName(): string {
    return 'mailtrap';
  }
}
