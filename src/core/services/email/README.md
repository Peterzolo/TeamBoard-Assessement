# Email Service Architecture

This email service provides a scalable and flexible way to send emails using different providers. You can easily switch between email providers by simply changing the `MAIL_CLIENT` environment variable.

## Supported Providers

- **Mailtrap** - For testing and development
- **Resend** - For production email delivery
- **Gmail** - For development using Gmail SMTP

## Quick Start

1. **Set your email provider** in your `.env` file:
   ```env
   MAIL_CLIENT=mailtrap  # or 'resend' or 'gmail'
   ```

2. **Configure the provider** with the required credentials (see Configuration section below)

3. **Use the EmailService** in your application:
   ```typescript
   import { EmailService } from './core/services/email.service';
   
   // Inject the service
   constructor(private readonly emailService: EmailService) {}
   
   // Send an email
   const success = await this.emailService.sendEmail('user@example.com', emailTemplate);
   ```

## Configuration

### Mailtrap (Testing)
```env
MAIL_CLIENT=mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_mailtrap_username
MAILTRAP_PASS=your_mailtrap_password
MAIL_FROM=no-reply@bestpracticesltd.com
```

### Resend (Production)
```env
MAIL_CLIENT=resend
RESEND_API_KEY=your_resend_api_key_here
MAIL_FROM=no-reply@bestpracticesltd.com
```

### Gmail (Development)
```env
MAIL_CLIENT=gmail
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password
MAIL_FROM=no-reply@gmail.com
```

## Switching Providers

To switch between email providers, simply change the `MAIL_CLIENT` value in your `.env` file and restart your application:

```env
# Switch from Mailtrap to Resend
MAIL_CLIENT=resend
```

The system will automatically:
1. Initialize the new provider with the appropriate configuration
2. Use the new provider for all email sending operations
3. Log the provider change for monitoring

## Architecture

### Core Components

1. **IEmailProvider Interface** - Defines the contract for all email providers
2. **BaseEmailProvider** - Abstract base class with common functionality
3. **Provider Implementations** - Specific implementations for each email service
4. **EmailProviderFactory** - Creates and configures the appropriate provider
5. **EmailService** - Main service that uses the factory to send emails

### Provider Structure

```
src/core/services/email/
├── interfaces/
│   └── email-provider.interface.ts
├── providers/
│   ├── base-email-provider.ts
│   ├── mailtrap.provider.ts
│   ├── resend.provider.ts
│   └── gmail.provider.ts
├── email-provider.factory.ts
└── README.md
```

## Adding New Providers

To add a new email provider:

1. **Create a new provider class** extending `BaseEmailProvider`:
   ```typescript
   @Injectable()
   export class NewProvider extends BaseEmailProvider {
     async initialize(config: NewProviderConfig): Promise<void> {
       // Initialize your provider
     }
     
     async sendEmail(to: string, template: BaseEmailTemplate, from?: string): Promise<EmailSendResult> {
       // Send email logic
     }
     
     getProviderName(): string {
       return 'new-provider';
     }
   }
   ```

2. **Add the provider to the factory**:
   ```typescript
   // In email-provider.factory.ts
   case 'new-provider':
     return this.createNewProvider();
   ```

3. **Register in the module**:
   ```typescript
   // In core.module.ts
   providers: [..., NewProvider]
   ```

## Error Handling

The service includes comprehensive error handling:
- Provider initialization errors
- Email sending failures
- Invalid email addresses
- Missing configuration

All errors are logged with appropriate context and the service gracefully handles failures.

## Monitoring

The service logs:
- Provider initialization status
- Email sending success/failure
- Provider switches
- Configuration issues

## Dependencies

- **nodemailer** - For SMTP-based providers (Mailtrap, Gmail)
- **resend** - For Resend API (install with `npm install resend`)

## Best Practices

1. **Use Mailtrap for testing** - Prevents accidental emails to real users
2. **Use Resend for production** - Reliable delivery and analytics
3. **Set appropriate MAIL_FROM** - Use a verified domain for better deliverability
4. **Monitor logs** - Keep track of email sending success rates
5. **Test provider switches** - Verify configuration before switching in production
