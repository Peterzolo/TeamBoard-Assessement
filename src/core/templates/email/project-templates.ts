import { EmailTemplateUtils } from './base-template-utils';

interface ProjectTemplateData {
  projectName: string;
  actionUrl?: string;
}

export function projectAssignedTemplate(data: ProjectTemplateData) {
  const subject = `You were added to ${data.projectName}`;
  const content = `
    <div style="font-size:14px;color:#111;">
      <p style="margin:0 0 12px;">Hello,</p>
      <p style="margin:0 0 12px;">You've been assigned to the project <strong>${data.projectName}</strong>.</p>
      ${data.actionUrl ? `<div style="margin:18px 0;"><a href="${data.actionUrl}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Open project</a></div>` : ''}
      <p style="margin:12px 0 0;color:#444;">If you were not expecting this, you can ignore this email.</p>
    </div>
  `;
  const html = EmailTemplateUtils.generateFullTemplate(content);
  return { subject, html };
}

export function projectUnassignedTemplate(data: ProjectTemplateData) {
  const subject = `You were removed from ${data.projectName}`;
  const content = `
    <div style="font-size:14px;color:#111;">
      <p style="margin:0 0 12px;">Hello,</p>
      <p style="margin:0 0 12px;">You've been unassigned from the project <strong>${data.projectName}</strong>.</p>
      <p style="margin:12px 0 0;color:#444;">If this seems unexpected, please contact your administrator.</p>
    </div>
  `;
  const html = EmailTemplateUtils.generateFullTemplate(content);
  return { subject, html };
}
