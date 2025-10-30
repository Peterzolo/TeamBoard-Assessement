import { Injectable } from '@nestjs/common';

@Injectable()
export class TemplateService {
  async renderEmailTemplate(templateName: string, context: any): Promise<{ subject: string; html: string }> {
    let subject = 'Service Request Update';
    let html = '';

    switch (templateName) {
      case 'service-request-confirmation':
        subject = 'Service Request Confirmation';
        html = this.generateServiceRequestConfirmationTemplate(context);
        break;
      case 'service-request-status-update':
        subject = 'Service Request Status Update';
        html = this.generateStatusUpdateTemplate(context);
        break;
      case 'technician-assignment':
        subject = 'Technician Assigned to Your Service Request';
        html = this.generateTechnicianAssignmentTemplate(context);
        break;
      case 'service-request-created-admin':
        subject = 'New Service Request Created - Admin Notification';
        html = this.generateServiceRequestCreatedAdminTemplate(context);
        break;
      case 'service-request-updated-admin':
        subject = 'Service Request Updated - Admin Notification';
        html = this.generateServiceRequestUpdatedAdminTemplate(context);
        break;
      case 'service-request-approved-customer':
        subject = 'Service Request Approved';
        html = this.generateServiceRequestApprovedCustomerTemplate(context);
        break;
      case 'service-request-rejected-customer':
        subject = 'Service Request Update';
        html = this.generateServiceRequestRejectedCustomerTemplate(context);
        break;
      case 'service-request-completed-customer':
        subject = 'Service Request Completed';
        html = this.generateServiceRequestCompletedCustomerTemplate(context);
        break;
      case 'service-request-cancelled-customer':
        subject = 'Service Request Cancelled';
        html = this.generateServiceRequestCancelledCustomerTemplate(context);
        break;
      default:
        html = this.generateDefaultTemplate(context);
    }

    return { subject, html };
  }

  private generateServiceRequestConfirmationTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Confirmation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Service Request Confirmed</h1>
          <p>Your service request has been successfully created!</p>
        </div>
        
        <div class="content">
          <p>Dear Customer,</p>
          
          <p>Thank you for submitting your service request. We're excited to work with you!</p>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Priority:</span>
            <span class="value">${context.priority}</span>
          </div>
          
          ${context.expectedDelivery ? `
          <div class="info-row">
            <span class="label">Expected Delivery:</span>
            <span class="value">${new Date(context.expectedDelivery).toLocaleDateString()}</span>
          </div>
          ` : ''}
          
          ${context.totalCost ? `
          <div class="info-row">
            <span class="label">Total Estimated Cost:</span>
            <span class="value">₦${context.totalCost.toLocaleString()}</span>
          </div>
          ` : ''}
          
          <h3>What happens next?</h3>
          <ol>
            <li>Our team will review your request</li>
            <li>We'll contact you if we need additional information</li>
            <li>You'll receive updates on the progress</li>
            <li>We'll notify you when work begins</li>
          </ol>
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateStatusUpdateTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Status Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .rejection-reason { background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .rejection-reason h4 { color: #DC2626; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Service Request Status Update</h1>
          <p>Your service request status has been updated</p>
        </div>
        
        <div class="content">
          <p>Dear Customer,</p>
          
          <p>Your service request status has been updated. Here are the details:</p>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Previous Status:</span>
            <span class="value">${context.oldStatus}</span>
          </div>
          
          <div class="info-row">
            <span class="label">New Status:</span>
            <span class="value">${context.newStatus}</span>
          </div>
          
          ${context.rejectionReason ? `
          <div class="rejection-reason">
            <h4>❌ Rejection Reason</h4>
            <p>${context.rejectionReason}</p>
            <p><strong>Next Steps:</strong> Please review the feedback and update your service request accordingly.</p>
          </div>
          ` : ''}
          
          <h3>What this status means:</h3>
          
          ${context.newStatus === 'Approved' ? `
          <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #059669; margin-top: 0;">🎉 Your request has been approved!</h4>
            <p>We're excited to work on your service request. Our team will begin processing it shortly.</p>
          </div>
          ` : ''}
          
          ${context.newStatus === 'In Progress' ? `
          <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #1D4ED8; margin-top: 0;">🚀 Work has begun on your request!</h4>
            <p>Our team is actively working on your service request. You'll receive regular updates on the progress.</p>
          </div>
          ` : ''}
          
          ${context.newStatus === 'Completed' ? `
          <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <h4 style="color: #059669; margin-top: 0;">✅ Your service request has been completed!</h4>
            <p>We're pleased to inform you that your service request has been completed successfully.</p>
          </div>
          ` : ''}
          
          <p>If you have any questions about this status update, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateTechnicianAssignmentTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Technician Assigned to Your Service Request</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .technician-info { background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .technician-info h3 { color: #1D4ED8; margin-top: 0; }
          .next-steps { background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .next-steps h3 { color: #059669; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>👨‍🔧 Technician Assigned!</h1>
          <p>A skilled technician has been assigned to your service request</p>
        </div>
        
        <div class="content">
          <p>Dear Customer,</p>
          
          <p>Great news! We've assigned a qualified technician to work on your service request. This means work will begin soon!</p>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="technician-info">
            <h3>🛠️ Your Assigned Technician</h3>
            <p><strong>Technician ID:</strong> ${context.technicianId?.toString() || 'N/A'}</p>
            <p>Our technicians are carefully selected based on their expertise and experience with your specific service type.</p>
          </div>
          
          <div class="next-steps">
            <h3>📋 What happens next?</h3>
            <ol>
              <li><strong>Initial Contact:</strong> Your technician will review your service request details</li>
              <li><strong>Planning:</strong> They'll create a detailed work plan and timeline</li>
              <li><strong>Communication:</strong> You'll receive regular updates on progress</li>
              <li><strong>Quality Check:</strong> Work will be reviewed before completion</li>
              <li><strong>Delivery:</strong> Final delivery or pickup arrangements</li>
            </ol>
          </div>
          
          <p>If you have any questions about your technician assignment, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
          
          <p><strong>We're excited to work on your service request and deliver excellent results!</strong></p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateDefaultTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Service Request Update</h1>
          <p>Your service request has been updated</p>
        </div>
        
        <div class="content">
          <p>Dear Customer,</p>
          
          <p>Your service request has been updated. Please check your dashboard for more details.</p>
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestCreatedAdminTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Service Request Created</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3B82F6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .urgent { background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .urgent h4 { color: #DC2626; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔔 New Service Request Created</h1>
          <p>A new service request requires your attention</p>
        </div>
        
        <div class="content">
          <p>Dear Admin,</p>
          
          <p>A new service request has been created and requires your review:</p>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Customer Name:</span>
            <span class="value">${context.customerName}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Customer Email:</span>
            <span class="value">${context.customerEmail}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Priority:</span>
            <span class="value">${context.priority}</span>
          </div>
          
          ${context.totalCost ? `
          <div class="info-row">
            <span class="label">Estimated Cost:</span>
            <span class="value">₦${context.totalCost.toLocaleString()}</span>
          </div>
          ` : ''}
          
          ${context.priority === 'Urgent' ? `
          <div class="urgent">
            <h4>⚠️ URGENT REQUEST</h4>
            <p>This service request has been marked as urgent and requires immediate attention.</p>
          </div>
          ` : ''}
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Review the service request details</li>
            <li>Contact the customer if additional information is needed</li>
            <li>Approve or reject the request based on feasibility</li>
            <li>Assign a technician if approved</li>
          </ol>
          
          <p><strong>Action Required:</strong> Please log into the admin dashboard to review and process this request.</p>
        </div>
        
        <div class="footer">
          <p>NUSpring Logistics Admin System</p>
          <p>This is an automated notification. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestUpdatedAdminTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Updated</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .changes { background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .changes h4 { color: #D97706; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📝 Service Request Updated</h1>
          <p>A service request has been modified by the customer</p>
        </div>
        
        <div class="content">
          <p>Dear Admin,</p>
          
          <p>A service request has been updated by the customer:</p>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Customer Name:</span>
            <span class="value">${context.customerName}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Current Status:</span>
            <span class="value">${context.currentStatus}</span>
          </div>
          
          ${context.changes ? `
          <div class="changes">
            <h4>📋 Changes Made:</h4>
            <p>${context.changes}</p>
          </div>
          ` : ''}
          
          <h3>Action Required:</h3>
          <p>Please review the updated service request to ensure all changes are acceptable and don't affect the current workflow.</p>
          
          <p><strong>Note:</strong> If the request is already in progress, you may need to coordinate with the assigned technician about the changes.</p>
        </div>
        
        <div class="footer">
          <p>NUSpring Logistics Admin System</p>
          <p>This is an automated notification. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestApprovedCustomerTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Approved</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .status { background-color: #D1FAE5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .status h3 { color: #059669; margin-top: 0; }
          .notes { background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .notes h4 { color: #1D4ED8; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Service Request Approved!</h1>
          <p>Great news! Your service request has been approved</p>
        </div>
        
        <div class="content">
          <p>Dear ${context.customerName},</p>
          
          <p>We're excited to inform you that your service request has been approved and is ready to proceed!</p>
          
          <div class="status">
            <h3>✅ APPROVED</h3>
            <p>Your request is now in our system and ready for processing</p>
          </div>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          ${context.estimatedCompletion ? `
          <div class="info-row">
            <span class="label">Estimated Completion:</span>
            <span class="value">${new Date(context.estimatedCompletion).toLocaleDateString()}</span>
          </div>
          ` : ''}
          
          ${context.totalCost ? `
          <div class="info-row">
            <span class="label">Total Cost:</span>
            <span class="value">₦${context.totalCost.toLocaleString()}</span>
          </div>
          ` : ''}
          
          ${context.approvalNotes ? `
          <div class="notes">
            <h4>📝 Approval Notes:</h4>
            <p>${context.approvalNotes}</p>
          </div>
          ` : ''}
          
          <h3>What happens next?</h3>
          <ol>
            <li>Our team will begin working on your request</li>
            <li>You'll receive regular updates on progress</li>
            <li>We'll contact you if we need any additional information</li>
            <li>You'll be notified when work is completed</li>
          </ol>
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestRejectedCustomerTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Update</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #EF4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .status { background-color: #FEE2E2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .status h3 { color: #DC2626; margin-top: 0; }
          .reason { background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .reason h4 { color: #DC2626; margin-top: 0; }
          .suggestions { background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .suggestions h4 { color: #1D4ED8; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📋 Service Request Update</h1>
          <p>Your service request requires attention</p>
        </div>
        
        <div class="content">
          <p>Dear ${context.customerName},</p>
          
          <p>Thank you for your interest in our services. After careful review, we regret to inform you that we are unable to proceed with your service request at this time.</p>
          
          <div class="status">
            <h3>❌ UNABLE TO PROCEED</h3>
            <p>Your request requires additional information or modifications</p>
          </div>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="reason">
            <h4>📝 Reason:</h4>
            <p>${context.rejectionReason}</p>
          </div>
          
          ${context.additionalNotes ? `
          <div class="suggestions">
            <h4>💡 Suggestions:</h4>
            <p>${context.additionalNotes}</p>
          </div>
          ` : ''}
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Review the feedback provided above</li>
            <li>Update your service request with the suggested improvements</li>
            <li>Resubmit your request for reconsideration</li>
            <li>Contact us directly if you need assistance</li>
          </ol>
          
          <p>We encourage you to submit a new service request with the suggested improvements, or contact us directly to discuss alternative solutions that might better meet your needs.</p>
          
          <p>If you have any questions, please don't hesitate to contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for your understanding, and we look forward to serving you in the future!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestCompletedCustomerTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .status { background-color: #D1FAE5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .status h3 { color: #059669; margin-top: 0; }
          .completion-notes { background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .completion-notes h4 { color: #1D4ED8; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎉 Service Request Completed!</h1>
          <p>Your service request has been successfully completed</p>
        </div>
        
        <div class="content">
          <p>Dear ${context.customerName},</p>
          
          <p>We're pleased to inform you that your service request has been completed successfully!</p>
          
          <div class="status">
            <h3>✅ COMPLETED</h3>
            <p>Your service request has been finished and is ready for delivery/pickup</p>
          </div>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Completion Date:</span>
            <span class="value">${new Date(context.completionDate).toLocaleDateString()}</span>
          </div>
          
          ${context.totalCost ? `
          <div class="info-row">
            <span class="label">Final Cost:</span>
            <span class="value">₦${context.totalCost.toLocaleString()}</span>
          </div>
          ` : ''}
          
          ${context.completionNotes ? `
          <div class="completion-notes">
            <h4>📝 Completion Notes:</h4>
            <p>${context.completionNotes}</p>
          </div>
          ` : ''}
          
          <h3>Next Steps:</h3>
          <ol>
            <li>Review the completed work</li>
            <li>Arrange for delivery or pickup</li>
            <li>Complete payment if required</li>
            <li>Provide feedback on your experience</li>
          </ol>
          
          <p>We hope you're satisfied with our service! If you have any questions or need assistance with delivery arrangements, please contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing NUSpring Logistics!</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateServiceRequestCancelledCustomerTemplate(context: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Service Request Cancelled</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
          .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background-color: white; border-radius: 4px; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .status { background-color: #FEF3C7; border: 1px solid #FDE68A; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .status h3 { color: #D97706; margin-top: 0; }
          .reason { background-color: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 15px; margin: 20px 0; }
          .reason h4 { color: #DC2626; margin-top: 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>⚠️ Service Request Cancelled</h1>
          <p>Your service request has been cancelled</p>
        </div>
        
        <div class="content">
          <p>Dear ${context.customerName},</p>
          
          <p>We're writing to inform you that your service request has been cancelled.</p>
          
          <div class="status">
            <h3>❌ CANCELLED</h3>
            <p>This service request is no longer active</p>
          </div>
          
          <div class="info-row">
            <span class="label">Service Request ID:</span>
            <span class="value">${context.serviceRequestId?.toString() || 'N/A'}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Service Type:</span>
            <span class="value">${context.serviceType}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Cancellation Date:</span>
            <span class="value">${new Date(context.cancellationDate).toLocaleDateString()}</span>
          </div>
          
          ${context.cancellationReason ? `
          <div class="reason">
            <h4>📝 Cancellation Reason:</h4>
            <p>${context.cancellationReason}</p>
          </div>
          ` : ''}
          
          <h3>What this means:</h3>
          <ul>
            <li>Work on this service request has been stopped</li>
            <li>Any associated costs will be calculated based on work completed</li>
            <li>You may be eligible for a partial refund if applicable</li>
            <li>You can create a new service request if needed</li>
          </ul>
          
          <p>If you have any questions about this cancellation or need to discuss alternative options, please contact us:</p>
          <ul>
            <li>📧 Email: support@nuspringlogistics.com</li>
            <li>📞 Phone: +234 XXX XXX XXXX</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Thank you for your understanding.</p>
          <p>This is an automated email. Please do not reply directly to this message.</p>
        </div>
      </body>
      </html>
    `;
  }
}
