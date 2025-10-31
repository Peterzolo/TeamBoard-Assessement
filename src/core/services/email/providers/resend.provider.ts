import { Injectable } from '@nestjs/common';
import { BaseEmailTemplate } from '../../../templates/email';
import { BaseEmailProvider } from './base-email-provider';
import {
  EmailProviderConfig,
  EmailSendResult,
} from '../interfaces/email-provider.interface';

export interface ResendConfig extends EmailProviderConfig {
  apiKey: string;
  from?: string;
}

@Injectable()
export class ResendProvider extends BaseEmailProvider {
  private resendClient: any = null;

  async initialize(config: ResendConfig): Promise<void> {
    try {
      const { apiKey } = config;

      if (!apiKey) {
        throw new Error('Resend configuration is incomplete. Required: apiKey');
      }

      // Dynamically import Resend to avoid dependency issues if not installed
      try {
        // @ts-ignore - Resend package is optional
        const { Resend } = await import('resend');
        this.resendClient = new Resend(apiKey);
      } catch (importError) {
        throw new Error(
          'Resend package not installed. Please run: npm install resend',
        );
      }

      this.config = config;
      this.isInitialized = true;
      this.logger.log('Resend provider initialized successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to initialize Resend provider: ${errorMessage}`,
      );
      throw error;
    }
  }

  async sendEmail(
    to: string,
    template: BaseEmailTemplate,
    from?: string,
  ): Promise<EmailSendResult> {
    if (!this.isInitialized || !this.resendClient) {
      return this.createErrorResult('Resend provider not initialized');
    }

    if (!this.validateEmail(to)) {
      return this.createErrorResult(`Invalid email address: ${to}`);
    }

    try {
      const fromEmail =
        from || this.config.from || 'no-reply@bestpracticesltd.com';

      const result = await this.resendClient.emails.send({
        from: fromEmail,
        to: [to],
        subject: template.subject,
        html: template.html,
      });

      if (result.error) {
        this.logger.error(
          `Failed to send email via Resend to ${to}: ${result.error.message || 'Unknown error'}`,
        );
        return this.createErrorResult(result.error.message || 'Unknown Resend error');
      }

      this.logger.log(
        `Email sent via Resend to ${to}. Message ID: ${result.data?.id}`,
      );
      return this.createSuccessResult(result.data?.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send email via Resend to ${to}: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
      return this.createErrorResult(errorMessage);
    }
  }

  getProviderName(): string {
    return 'resend';
  }
}
