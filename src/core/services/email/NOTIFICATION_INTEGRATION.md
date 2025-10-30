# Email Notification Integration

## 📧 **Automatic Database Notifications**

Every email sent through the `EmailService` is now automatically saved as a notification in the database. This provides:

- ✅ **Complete audit trail** of all email communications
- ✅ **User notification history** for tracking
- ✅ **Failed email tracking** for debugging
- ✅ **Email delivery status** monitoring
- ✅ **Rich metadata** storage for each email

## 🔄 **How It Works**

### **1. Email Sending Process**
```typescript
// When you send an email
await this.emailService.sendServiceRequestApprovalNotification(
  'customer@example.com',
  'John Doe',
  'Food Items',
  'req-123',
  'Approved with notes',
  '2024-01-15',
  500,
  'customer-user-id' // This triggers database notification
);
```

### **2. Automatic Database Storage**
The system automatically:
1. **Sends the email** via the configured provider
2. **Saves notification to database** with:
   - Email subject as notification title
   - Plain text version of email content
   - Recipient ID for user association
   - Email provider and message ID
   - Success/failure status
   - Rich metadata (service request details, etc.)

### **3. Notification Data Structure**
```typescript
{
  type: 'SERVICE_REQUEST_APPROVED',
  channel: 'EMAIL',
  priority: 'MEDIUM',
  title: 'Service Request Approved',
  message: 'Your service request has been approved...',
  recipientId: 'customer-user-id',
  data: {
    serviceRequestId: 'req-123',
    serviceType: 'Food Items',
    customerName: 'John Doe',
    emailSubject: 'Service Request Approved',
    messageId: 'msg-abc123',
    provider: 'mailtrap',
    sentAt: '2024-01-10T10:30:00Z',
    approvalNotes: 'Approved with notes',
    totalCost: 500
  },
  status: 'sent',
  sentAt: '2024-01-10T10:30:00Z',
  externalId: 'msg-abc123'
}
```

## 📊 **Supported Notification Types**

### **Service Request Notifications**
- `SERVICE_REQUEST_CREATED` - New service request created
- `SERVICE_REQUEST_UPDATED` - Service request updated
- `SERVICE_REQUEST_APPROVED` - Service request approved
- `SERVICE_REQUEST_REJECTED` - Service request rejected
- `SERVICE_REQUEST_COMPLETED` - Service request completed
- `SERVICE_REQUEST_CANCELLED` - Service request cancelled

### **Email Channels**
- `EMAIL` - All email notifications are stored with this channel

## 🎯 **Usage Examples**

### **1. Customer Notifications**
```typescript
// Approval notification (saves to database automatically)
await this.emailService.sendServiceRequestApprovalNotification(
  'customer@example.com',
  'John Doe',
  'Food Items',
  'req-123',
  'Approved with notes',
  '2024-01-15',
  500,
  'customer-user-id' // Required for database notification
);

// Rejection notification (saves to database automatically)
await this.emailService.sendServiceRequestRejectionNotification(
  'customer@example.com',
  'John Doe',
  'Food Items',
  'req-123',
  'Insufficient information',
  'Please provide more details',
  'customer-user-id' // Required for database notification
);
```

### **2. Admin Notifications**
```typescript
// Admin notification for new request (saves to database automatically)
await this.emailService.sendServiceRequestCreatedAdminNotification(
  'admin@company.com',
  'John Doe',
  'customer@example.com',
  'Food Items',
  'req-123',
  'High',
  500,
  'admin-user-id' // Required for database notification
);
```

### **3. Generic Email with Notification**
```typescript
// Send any email with database notification
await this.emailService.sendEmailWithTemplate(
  'user@example.com',
  'welcome-template',
  { name: 'John' },
  'user-id', // Required for database notification
  NotificationType.WELCOME, // Notification type
  { templateName: 'welcome-template' } // Additional data
);
```

## 🔍 **Database Query Examples**

### **Get All Email Notifications for a User**
```typescript
// Find all email notifications for a specific user
const emailNotifications = await notificationModel.find({
  recipientId: 'user-id',
  channel: 'EMAIL'
}).sort({ createdAt: -1 });
```

### **Get Failed Email Notifications**
```typescript
// Find all failed email notifications
const failedEmails = await notificationModel.find({
  channel: 'EMAIL',
  status: 'failed'
});
```

### **Get Notifications by Service Request**
```typescript
// Find all notifications related to a service request
const serviceRequestNotifications = await notificationModel.find({
  'data.serviceRequestId': 'req-123',
  channel: 'EMAIL'
});
```

### **Get Notifications by Email Provider**
```typescript
// Find all notifications sent via a specific provider
const mailtrapNotifications = await notificationModel.find({
  'data.provider': 'mailtrap',
  channel: 'EMAIL'
});
```

## 📈 **Monitoring & Analytics**

### **Email Delivery Success Rate**
```typescript
const totalEmails = await notificationModel.countDocuments({
  channel: 'EMAIL'
});

const successfulEmails = await notificationModel.countDocuments({
  channel: 'EMAIL',
  status: 'sent'
});

const successRate = (successfulEmails / totalEmails) * 100;
```

### **Provider Performance**
```typescript
// Compare provider performance
const providerStats = await notificationModel.aggregate([
  { $match: { channel: 'EMAIL' } },
  { $group: {
    _id: '$data.provider',
    total: { $sum: 1 },
    successful: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } }
  }},
  { $project: {
    provider: '$_id',
    total: 1,
    successful: 1,
    successRate: { $multiply: [{ $divide: ['$successful', '$total'] }, 100] }
  }}
]);
```

## 🛠️ **Configuration**

### **Environment Variables**
```bash
# Email provider selection
MAIL_CLIENT=mailtrap  # or 'gmail' or 'resend'

# Provider-specific settings
MAILTRAP_HOST=sandbox.smtp.mailtrap.io
MAILTRAP_PORT=2525
MAILTRAP_USER=your_username
MAILTRAP_PASS=your_password

GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_app_password

RESEND_API_KEY=your_api_key

# Common settings
MAIL_FROM=no-reply@yourcompany.com
```

### **Database Schema**
The notifications are stored in the `notifications` collection with the following structure:
- `type` - Notification type (enum)
- `channel` - Always 'EMAIL' for email notifications
- `priority` - Notification priority level
- `title` - Email subject line
- `message` - Plain text version of email content
- `recipientId` - User ID who received the email
- `data` - Rich metadata including email details
- `status` - 'sent', 'failed', or 'pending'
- `sentAt` - When the email was sent
- `externalId` - Email provider's message ID
- `errorMessage` - Error details if sending failed

## 🚨 **Error Handling**

### **Email Sending Failures**
- Failed emails are still saved to database with `status: 'failed'`
- Error messages are stored in `errorMessage` field
- Main application flow continues even if email fails
- Comprehensive logging for debugging

### **Database Notification Failures**
- If saving notification fails, email sending still continues
- Errors are logged but don't break email functionality
- Graceful degradation ensures email delivery isn't affected

## 🔧 **Troubleshooting**

### **Common Issues**

#### **1. Notifications Not Being Saved**
- Check if `recipientId` is provided in email method calls
- Verify `NotificationService` is properly injected
- Check database connection and permissions

#### **2. Missing Notification Types**
- Ensure `NotificationType` enum includes all required types
- Check if notification type is properly passed to email methods

#### **3. Email Sending but No Database Record**
- Verify `recipientId` parameter is not null/undefined
- Check if notification saving is failing silently
- Review application logs for notification service errors

### **Debug Mode**
```typescript
// Enable debug logging
this.logger.debug('Email notification data:', {
  recipientId,
  notificationType,
  subject: template.subject,
  provider: this.getCurrentProvider()
});
```

## 📋 **Best Practices**

1. **Always provide recipientId** - Required for database notifications
2. **Use appropriate notification types** - Helps with categorization
3. **Include rich metadata** - Makes notifications more useful
4. **Monitor email delivery rates** - Track success/failure rates
5. **Handle errors gracefully** - Don't let email failures break main flow
6. **Regular cleanup** - Archive old notifications periodically
7. **Test with different providers** - Ensure all providers work correctly

## 🎉 **Benefits**

- ✅ **Complete audit trail** of all email communications
- ✅ **User notification history** for customer support
- ✅ **Email delivery monitoring** for reliability
- ✅ **Rich metadata storage** for analytics
- ✅ **Failed email tracking** for debugging
- ✅ **Provider performance comparison** for optimization
- ✅ **Seamless integration** with existing email system
- ✅ **Zero breaking changes** to existing code

The notification integration provides comprehensive tracking and monitoring of all email communications while maintaining the existing email functionality.
