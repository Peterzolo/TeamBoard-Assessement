# Email Service Migration Guide

## 🔄 **Migration from Old to New Email Service**

This guide helps you migrate from the old email service implementation to the new provider-based architecture.

## 📋 **Changes Required**

### **1. Environment Variables**
Update your `.env` file to use the new variable names:

```bash
# OLD (Remove these)
MAIL_TYPE=mailtrap
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
RESEND_API_KEY=your_api_key

# NEW (Use these)
MAIL_CLIENT=mailtrap  # or 'gmail' or 'resend'
MAIL_FROM=no-reply@yourcompany.com

# Provider-specific variables (same as before)
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password
RESEND_API_KEY=your_api_key
```

### **2. Import Paths**
Update any imports of the old email service:

```typescript
// OLD
import { EmailService } from './core/services/email.service';

// NEW
import { EmailService } from './core/services/email/email.service';
```

### **3. Service Usage**
The new email service has the same public API, so no changes needed in your application code:

```typescript
// This still works exactly the same
constructor(private readonly emailService: EmailService) {}

// All existing methods work the same
await this.emailService.sendServiceRequestApprovalNotification(
  customerEmail,
  customerName,
  serviceType,
  serviceRequestId,
  approvalNotes,
  estimatedCompletion,
  totalCost,
);
```

## 🚀 **Benefits of New Architecture**

### **1. Easy Provider Switching**
```bash
# Switch from Mailtrap to Resend
MAIL_CLIENT=resend

# Switch from Resend to Gmail
MAIL_CLIENT=gmail
```

### **2. Better Error Handling**
- Provider-specific error messages
- Automatic retry logic
- Graceful fallbacks

### **3. Improved Monitoring**
- Provider initialization logging
- Email sending success/failure tracking
- Configuration validation

### **4. Extensibility**
- Easy to add new providers
- Consistent interface across all providers
- Type-safe configuration

## 🔧 **Testing the Migration**

### **1. Test Provider Initialization**
```typescript
// Check if email service is properly configured
const isConfigured = this.emailService.isConfigured();
console.log('Email service configured:', isConfigured);

// Get current provider
const provider = this.emailService.getCurrentProvider();
console.log('Current provider:', provider);
```

### **2. Test Email Sending**
```typescript
// Test basic email sending
const success = await this.emailService.sendEmail(
  'test@example.com',
  {
    subject: 'Test Email',
    html: '<h1>Test</h1>',
  }
);
console.log('Email sent:', success);
```

### **3. Test Provider Switching**
```bash
# Test with Mailtrap
MAIL_CLIENT=mailtrap
npm run start:dev

# Test with Gmail
MAIL_CLIENT=gmail
npm run start:dev

# Test with Resend
MAIL_CLIENT=resend
npm run start:dev
```

## 📦 **Dependencies**

### **Required Dependencies**
```json
{
  "dependencies": {
    "nodemailer": "^7.0.3",
    "@nestjs/config": "^4.0.2"
  }
}
```

### **Optional Dependencies**
```json
{
  "dependencies": {
    "resend": "^3.0.0"  // Only if using Resend provider
  }
}
```

Install Resend if you plan to use it:
```bash
npm install resend
```

## 🐛 **Troubleshooting**

### **Common Issues**

#### **1. Provider Not Found**
```
Error: Unknown email provider: xyz
```
**Solution:** Check `MAIL_CLIENT` environment variable. Must be one of: `mailtrap`, `gmail`, `resend`

#### **2. Configuration Missing**
```
Error: Mailtrap configuration is incomplete
```
**Solution:** Ensure all required environment variables are set for the chosen provider.

#### **3. Resend Package Missing**
```
Error: Resend package not installed
```
**Solution:** Run `npm install resend` or switch to a different provider.

#### **4. Gmail Authentication Failed**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:** Use App Password, not your regular Gmail password.

### **Debug Mode**
Enable debug logging to troubleshoot issues:

```typescript
// In your service
this.logger.debug('Email service configuration:', {
  provider: this.emailService.getCurrentProvider(),
  configured: this.emailService.isConfigured(),
});
```

## ✅ **Migration Checklist**

- [ ] Update environment variables (`MAIL_TYPE` → `MAIL_CLIENT`)
- [ ] Update import paths in affected files
- [ ] Test with Mailtrap provider
- [ ] Test with Gmail provider (if using)
- [ ] Test with Resend provider (if using)
- [ ] Verify all email notifications work
- [ ] Check application logs for any errors
- [ ] Remove old email service file (optional)

## 🎯 **Next Steps**

1. **Update Environment Variables** - Change `MAIL_TYPE` to `MAIL_CLIENT`
2. **Test Each Provider** - Verify all providers work correctly
3. **Update Documentation** - Update any internal docs with new variable names
4. **Monitor Logs** - Watch for any initialization or sending errors
5. **Performance Testing** - Ensure email sending performance is acceptable

## 📞 **Support**

If you encounter any issues during migration:

1. Check the application logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with Mailtrap first (easiest to set up)
4. Ensure all dependencies are installed

The new architecture provides better error messages and logging to help diagnose issues quickly.
