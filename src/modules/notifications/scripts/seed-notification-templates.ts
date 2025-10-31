import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  NotificationTemplate,
  TemplateStatus,
} from '../entities/notification-template.entity';
import {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

@Injectable()
export class NotificationTemplateSeeder {
  constructor(
    @InjectModel(NotificationTemplate.name)
    private templateModel: Model<NotificationTemplate>,
  ) {}

  async seedTemplates(): Promise<void> {
    const templates = [
      // Work Order Templates (using SERVICE_REQUEST_CREATED as equivalent)
      {
        name: 'work-order-created-email',
        type: NotificationType.SERVICE_REQUEST_CREATED,
        channel: NotificationChannel.EMAIL,
        subject: 'New Work Order Created - {{workOrderNumber}}',
        content: `
A new work order has been created in the system.

Work Order Details:
- Number: {{workOrderNumber}}
- Priority: {{priority}}
- Description: {{description}}
- Created By: {{createdBy}}
- Created At: {{createdAt}}

Please review and assign to an appropriate technician.

Best regards,
Inventory Management System
        `,
        variables: [
          'workOrderNumber',
          'priority',
          'description',
          'createdBy',
          'createdAt',
        ],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for new work order creation',
      },
      {
        name: 'work-order-assigned-email',
        type: NotificationType.SERVICE_REQUEST_UPDATED,
        channel: NotificationChannel.EMAIL,
        subject: 'Work Order Assigned to You - {{workOrderNumber}}',
        content: `
Hello {{technicianName}},

You have been assigned a new work order.

Work Order Details:
- Number: {{workOrderNumber}}
- Priority: {{priority}}
- Description: {{description}}
- Due Date: {{dueDate}}
- Assigned By: {{assignedBy}}
- Assigned At: {{assignedAt}}

Please review the work order details and begin work as soon as possible.

Best regards,
Inventory Management System
        `,
        variables: [
          'technicianName',
          'workOrderNumber',
          'priority',
          'description',
          'dueDate',
          'assignedBy',
          'assignedAt',
        ],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for work order assignment',
      },
      {
        name: 'work-order-completed-email',
        type: NotificationType.SERVICE_REQUEST_COMPLETED,
        channel: NotificationChannel.EMAIL,
        subject: 'Work Order Completed - {{workOrderNumber}}',
        content: `
Work Order {{workOrderNumber}} has been completed successfully.

Completion Details:
- Completed By: {{completedBy}}
- Completed At: {{completedAt}}
- Completion Notes: {{completionNotes}}
- Status: {{status}}

Thank you for your work!

Best regards,
Inventory Management System
        `,
        variables: [
          'workOrderNumber',
          'completedBy',
          'completedAt',
          'completionNotes',
          'status',
        ],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for work order completion',
      },
      // Low Stock Templates (using PAYMENT_CREATED as placeholder)
      {
        name: 'low-stock-email',
        type: NotificationType.PAYMENT_CREATED,
        channel: NotificationChannel.EMAIL,
        subject: 'Low Stock Alert - {{productName}}',
        content: `
Low Stock Alert

Product: {{productName}}
Current Stock: {{currentStock}}
Minimum Stock: {{minStock}}
SKU: {{sku}}

Please reorder this product to avoid stockouts.

Best regards,
Inventory Management System
        `,
        variables: ['productName', 'currentStock', 'minStock', 'sku'],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for low stock alerts',
      },
      {
        name: 'out-of-stock-email',
        type: NotificationType.PAYMENT_REJECTED,
        channel: NotificationChannel.EMAIL,
        subject: 'URGENT: Out of Stock - {{productName}}',
        content: `
URGENT: Out of Stock Alert

Product: {{productName}}
Current Stock: {{currentStock}}
SKU: {{sku}}

This product is now out of stock. Please reorder immediately.

Best regards,
Inventory Management System
        `,
        variables: ['productName', 'currentStock', 'sku'],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for out of stock alerts',
      },
      // Order Templates (using BILLING_DOCUMENT_CREATED as placeholder)
      {
        name: 'new-order-email',
        type: NotificationType.BILLING_DOCUMENT_CREATED,
        channel: NotificationChannel.EMAIL,
        subject: 'New Order Received - {{orderNumber}}',
        content: `
New Order Received

Order Details:
- Order Number: {{orderNumber}}
- Customer: {{customerName}}
- Total Amount: {{totalAmount}}
- Order Date: {{orderDate}}
- Items: {{itemCount}} items

Please process this order promptly.

Best regards,
Inventory Management System
        `,
        variables: [
          'orderNumber',
          'customerName',
          'totalAmount',
          'orderDate',
          'itemCount',
        ],
        status: TemplateStatus.ACTIVE,
        description: 'Email template for new orders',
      },
    ];

    for (const templateData of templates) {
      const existingTemplate = await this.templateModel.findOne({
        name: templateData.name,
      });

      if (!existingTemplate) {
        const template = new this.templateModel(templateData);
        await template.save();
        console.log(`Created notification template: ${templateData.name}`);
      } else {
        console.log(
          `Notification template already exists: ${templateData.name}`,
        );
      }
    }
  }
}
