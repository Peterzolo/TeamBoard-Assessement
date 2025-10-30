import { EmailTemplateUtils } from './base-template-utils';

interface TaskTemplateData {
  userName: string;
  taskTitle: string;
  actionUrl?: string;
}

export function taskAssignedTemplate(data: TaskTemplateData) {
  const subject = `You were assigned: ${data.taskTitle}`;
  const content = `
    <div style="font-size:14px;color:#111;">
      <p style="margin:0 0 12px;">Hello ${data.userName},</p>
      <p style="margin:0 0 12px;">You've been assigned to the task <strong>${data.taskTitle}</strong>.</p>
      ${data.actionUrl ? `<div style=\"margin:18px 0;\"><a href=\"${data.actionUrl}\" style=\"display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;\">Open task</a></div>` : ''}
      <p style="margin:12px 0 0;color:#444;">If this seems unexpected, please contact your project manager.</p>
    </div>
  `;
  const html = EmailTemplateUtils.generateFullTemplate(content);
  return { subject, html };
}

export function taskUnassignedTemplate(data: TaskTemplateData) {
  const subject = `You were unassigned: ${data.taskTitle}`;
  const content = `
    <div style="font-size:14px;color:#111;">
      <p style="margin:0 0 12px;">Hello ${data.userName},</p>
      <p style="margin:0 0 12px;">You've been removed from the task <strong>${data.taskTitle}</strong>.</p>
      <p style="margin:12px 0 0;color:#444;">If this seems unexpected, please contact your project manager.</p>
    </div>
  `;
  const html = EmailTemplateUtils.generateFullTemplate(content);
  return { subject, html };
}


