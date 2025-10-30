import {
  Injectable,
  Logger,
  OnModuleInit,
  Optional,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseEmailTemplate } from '../templates/email';
import { EmailTemplateUtils } from '../templates/email/base-template-utils';
import { EmailProviderFactory } from './email/email-provider.factory';
import { IEmailProvider } from './email/interfaces/email-provider.interface';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private emailProvider: IEmailProvider | null = null;
  private mailFrom: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly emailProviderFactory: EmailProviderFactory,
    private readonly templateService: TemplateService,
    @Optional()
    @Inject('NotificationService')
    private readonly notificationService?: any,
  ) {
    this.mailFrom =
      this.configService.get<string>('MAIL_FROM') ||
      'no-reply@nuspringdynamics.com';
  }

  async onModuleInit() {
    try {
      this.emailProvider = await this.emailProviderFactory.createProvider();
      this.logger.log(
        `Email service initialized with provider: ${this.emailProvider.getProviderName()}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to initialize email service: ${errorMessage}`);
    }
  }

  async sendEmail(
    to: string,
    template: BaseEmailTemplate,
    recipientId?: string,
    notificationType?: string,
    additionalData?: Record<string, any>,
  ): Promise<boolean> {
    if (!this.emailProvider || !this.emailProvider.isConfigured()) {
      this.logger.error(
        `Failed to send email to ${to}: Email provider not configured`,
      );
      return false;
    }

    try {
      const result = await this.emailProvider.sendEmail(
        to,
        template,
        this.mailFrom,
      );

      if (result.success) {
        this.logger.log(
          `Email sent to ${to} via ${this.emailProvider.getProviderName()}. Message ID: ${result.messageId || 'N/A'}`,
        );

        // Save notification to database if recipientId is provided
        if (recipientId && notificationType) {
          await this.saveEmailNotification(
            recipientId,
            notificationType,
            template.subject,
            template.html,
            result.messageId,
            additionalData,
          );
        }

        return true;
      } else {
        this.logger.error(`Failed to send email to ${to}: ${result.error}`);

        // Save failed notification to database if recipientId is provided
        if (recipientId && notificationType) {
          await this.saveEmailNotification(
            recipientId,
            notificationType,
            template.subject,
            template.html,
            undefined,
            additionalData,
            result.error,
          );
        }

        return false;
      }
    } catch (error: unknown) {
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.stack || error.message;
      } else {
        errorMessage = JSON.stringify(error);
      }
      this.logger.error(`Failed to send email to ${to}`, errorMessage);

      // Save failed notification to database if recipientId is provided
      if (recipientId && notificationType) {
        await this.saveEmailNotification(
          recipientId,
          notificationType,
          template.subject,
          template.html,
          undefined,
          additionalData,
          errorMessage,
        );
      }

      return false;
    }
  }

  /**
   * Get the current email provider name
   */
  getCurrentProvider(): string {
    return this.emailProvider?.getProviderName() || 'none';
  }

  /**
   * Get all supported email providers
   */
  getSupportedProviders(): string[] {
    return this.emailProviderFactory.getSupportedProviders();
  }

  /**
   * Switch to a different email provider (requires service restart)
   */
  async switchProvider(providerType: string): Promise<boolean> {
    try {
      this.emailProvider = await this.emailProviderFactory.createProvider(
        providerType as any,
      );
      this.logger.log(
        `Switched to email provider: ${this.emailProvider.getProviderName()}`,
      );
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to switch email provider to ${providerType}: ${errorMessage}`,
      );
      return false;
    }
  }

  /**
   * Send email using template name and context
   */
  async sendEmailWithTemplate(
    to: string,
    templateName: string,
    context: any,
    recipientId?: string,
    notificationType?: string,
    additionalData?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const template = await this.templateService.renderEmailTemplate(
        templateName,
        context,
      );
      return await this.sendEmail(
        to,
        template,
        recipientId,
        notificationType,
        additionalData,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send email with template ${templateName}: ${errorMessage}`,
      );
      return false;
    }
  }

  /**
   * Save email notification to database
   */
  private async saveEmailNotification(
    recipientId: string,
    notificationType: string,
    subject: string,
    htmlContent: string,
    messageId?: string,
    additionalData?: Record<string, any>,
    errorMessage?: string,
  ): Promise<void> {
    // Skip notification saving if NotificationService is not available
    if (!this.notificationService) {
      this.logger.debug(
        'NotificationService not available, skipping database notification',
      );
      return;
    }

    try {
      const notificationData = {
        type: notificationType,
        channel: 'EMAIL',
        priority: 'MEDIUM',
        title: subject,
        message: this.extractTextFromHtml(htmlContent),
        recipientId,
        data: {
          ...additionalData,
          emailSubject: subject,
          messageId,
          provider: this.getCurrentProvider(),
          sentAt: new Date().toISOString(),
          ...(errorMessage && { error: errorMessage }),
        },
        status: errorMessage ? 'failed' : 'sent',
        sentAt: errorMessage ? undefined : new Date(),
        errorMessage,
        externalId: messageId,
        templateData: additionalData,
      };

      await this.notificationService.createNotification(notificationData);

      this.logger.log(
        `Email notification saved to database for recipient ${recipientId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save email notification to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // Don't throw error here to avoid breaking email sending
    }
  }

  /**
   * Extract plain text from HTML content for notification message
   */
  private extractTextFromHtml(html: string): string {
    // Simple HTML to text conversion
    return html
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&') // Replace &amp; with &
      .replace(/&lt;/g, '<') // Replace &lt; with <
      .replace(/&gt;/g, '>') // Replace &gt; with >
      .replace(/&quot;/g, '"') // Replace &quot; with "
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim()
      .substring(0, 500); // Limit to 500 characters
  }

  // Service Request Notifications for Customers
  async sendServiceRequestApprovalNotification(
    customerEmail: string,
    customerName: string,
    serviceType: string,
    serviceRequestId: string,
    approvalNotes?: string,
    estimatedCompletion?: string,
    totalCost?: number,
    customerId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      customerEmail,
      'service-request-approved-customer',
      {
        customerName,
        serviceType,
        serviceRequestId,
        approvalNotes,
        estimatedCompletion,
        totalCost,
      },
      customerId,
      'SERVICE_REQUEST_APPROVED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        customerEmail,
        approvalNotes,
        estimatedCompletion,
        totalCost,
      },
    );
  }

  async sendServiceRequestRejectionNotification(
    customerEmail: string,
    customerName: string,
    serviceType: string,
    serviceRequestId: string,
    rejectionReason: string,
    additionalNotes?: string,
    customerId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      customerEmail,
      'service-request-rejected-customer',
      {
        customerName,
        serviceType,
        serviceRequestId,
        rejectionReason,
        additionalNotes,
      },
      customerId,
      'SERVICE_REQUEST_REJECTED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        customerEmail,
        rejectionReason,
        additionalNotes,
      },
    );
  }

  async sendServiceRequestCompletedNotification(
    customerEmail: string,
    customerName: string,
    serviceType: string,
    serviceRequestId: string,
    completionDate: string,
    totalCost?: number,
    completionNotes?: string,
    customerId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      customerEmail,
      'service-request-completed-customer',
      {
        customerName,
        serviceType,
        serviceRequestId,
        completionDate,
        totalCost,
        completionNotes,
      },
      customerId,
      'SERVICE_REQUEST_COMPLETED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        customerEmail,
        completionDate,
        totalCost,
        completionNotes,
      },
    );
  }

  async sendServiceRequestCancelledNotification(
    customerEmail: string,
    customerName: string,
    serviceType: string,
    serviceRequestId: string,
    cancellationDate: string,
    cancellationReason?: string,
    customerId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      customerEmail,
      'service-request-cancelled-customer',
      {
        customerName,
        serviceType,
        serviceRequestId,
        cancellationDate,
        cancellationReason,
      },
      customerId,
      'SERVICE_REQUEST_CANCELLED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        customerEmail,
        cancellationDate,
        cancellationReason,
      },
    );
  }

  // Service Request Notifications for Admins
  async sendServiceRequestCreatedAdminNotification(
    adminEmail: string,
    customerName: string,
    customerEmail: string,
    serviceType: string,
    serviceRequestId: string,
    priority: string,
    totalCost?: number,
    adminId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      adminEmail,
      'service-request-created-admin',
      {
        customerName,
        customerEmail,
        serviceType,
        serviceRequestId,
        priority,
        totalCost,
      },
      adminId,
      'SERVICE_REQUEST_CREATED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        customerEmail,
        priority,
        totalCost,
        notificationFor: 'admin',
      },
    );
  }

  async sendServiceRequestUpdatedAdminNotification(
    adminEmail: string,
    customerName: string,
    serviceType: string,
    serviceRequestId: string,
    currentStatus: string,
    changes?: string,
    adminId?: string,
  ): Promise<boolean> {
    return this.sendEmailWithTemplate(
      adminEmail,
      'service-request-updated-admin',
      {
        customerName,
        serviceType,
        serviceRequestId,
        currentStatus,
        changes,
      },
      adminId,
      'SERVICE_REQUEST_UPDATED',
      {
        serviceRequestId,
        serviceType,
        customerName,
        currentStatus,
        changes,
        notificationFor: 'admin',
      },
    );
  }
}
