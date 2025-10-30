import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IEmailProvider } from './interfaces/email-provider.interface';
import {
  MailtrapProvider,
  MailtrapConfig,
} from './providers/mailtrap.provider';
import { ResendProvider, ResendConfig } from './providers/resend.provider';
import { GmailProvider, GmailConfig } from './providers/gmail.provider';

export type SupportedEmailProviders = 'mailtrap' | 'resend' | 'gmail';

@Injectable()
export class EmailProviderFactory {
  private readonly logger = new Logger(EmailProviderFactory.name);

  constructor(private readonly configService: ConfigService) {}

  async createProvider(
    providerType?: SupportedEmailProviders,
  ): Promise<IEmailProvider> {
    const mailClient =
      providerType ||
      this.configService.get<SupportedEmailProviders>('MAIL_CLIENT') ||
      'mailtrap';

    this.logger.log(`Creating email provider: ${mailClient}`);

    switch (mailClient.toLowerCase()) {
      case 'mailtrap':
        return this.createMailtrapProvider();

      case 'resend':
        return this.createResendProvider();

      case 'gmail':
        return this.createGmailProvider();

      default:
        this.logger.warn(
          `Unknown email provider: ${mailClient}, defaulting to mailtrap`,
        );
        return this.createMailtrapProvider();
    }
  }

  private async createMailtrapProvider(): Promise<IEmailProvider> {
    const config: MailtrapConfig = {
      host:
        this.configService.get<string>('MAILTRAP_HOST') ||
        'sandbox.smtp.mailtrap.io',
      port: Number(this.configService.get<string>('MAILTRAP_PORT')) || 2525,
      user: this.configService.get<string>('MAILTRAP_USER') || '',
      pass: this.configService.get<string>('MAILTRAP_PASS') || '',
      from:
        this.configService.get<string>('MAIL_FROM') ||
        'no-reply@bestpracticesltd.com',
    };

    const provider = new MailtrapProvider();
    await provider.initialize(config);
    return provider;
  }

  private async createResendProvider(): Promise<IEmailProvider> {
    const config: ResendConfig = {
      apiKey: this.configService.get<string>('RESEND_API_KEY') || '',
      from:
        this.configService.get<string>('MAIL_FROM') ||
        'no-reply@bestpracticesltd.com',
    };

    const provider = new ResendProvider();
    await provider.initialize(config);
    return provider;
  }

  private async createGmailProvider(): Promise<IEmailProvider> {
    const config: GmailConfig = {
      user: this.configService.get<string>('GMAIL_USER') || '',
      pass: this.configService.get<string>('GMAIL_PASS') || '',
      from: this.configService.get<string>('MAIL_FROM') || 'no-reply@gmail.com',
    };

    const provider = new GmailProvider();
    await provider.initialize(config);
    return provider;
  }

  getSupportedProviders(): SupportedEmailProviders[] {
    return ['mailtrap', 'resend', 'gmail'];
  }
}
