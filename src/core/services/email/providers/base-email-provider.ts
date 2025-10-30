import { Logger } from '@nestjs/common';
import { BaseEmailTemplate } from '../../../templates/email';
import {
  EmailProviderConfig,
  EmailSendResult,
  IEmailProvider,
} from '../interfaces/email-provider.interface';

export abstract class BaseEmailProvider implements IEmailProvider {
  protected readonly logger = new Logger(this.constructor.name);
  protected config: EmailProviderConfig = {};
  protected isInitialized = false;

  abstract initialize(config: EmailProviderConfig): Promise<void>;
  abstract sendEmail(
    to: string,
    template: BaseEmailTemplate,
    from?: string,
  ): Promise<EmailSendResult>;
  abstract getProviderName(): string;

  isConfigured(): boolean {
    return this.isInitialized;
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected createErrorResult(error: string): EmailSendResult {
    return {
      success: false,
      error,
    };
  }

  protected createSuccessResult(messageId?: string): EmailSendResult {
    return {
      success: true,
      messageId,
    };
  }
}
