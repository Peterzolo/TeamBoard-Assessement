import { BaseEmailTemplate } from '../../../templates/email';

export interface EmailProviderConfig {
  [key: string]: any;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IEmailProvider {
  /**
   * Initialize the email provider with configuration
   */
  initialize(config: EmailProviderConfig): Promise<void>;

  /**
   * Send an email using the provider
   */
  sendEmail(
    to: string,
    template: BaseEmailTemplate,
    from?: string,
  ): Promise<EmailSendResult>;

  /**
   * Get the provider name
   */
  getProviderName(): string;

  /**
   * Check if the provider is properly configured
   */
  isConfigured(): boolean;
}
