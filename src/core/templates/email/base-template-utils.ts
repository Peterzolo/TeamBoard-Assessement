import {
  CompanyBranding,
  DEFAULT_COMPANY_BRANDING,
} from './base-template.interface';

export class EmailTemplateUtils {
  static generateHeader(
    branding: CompanyBranding = DEFAULT_COMPANY_BRANDING,
  ): string {
    return `
      <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 30px 0; text-align: center; border-radius: 8px 8px 0 0;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px;">
          <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px;">
            TEAMBOARD
          </h1>
        </div>
      </div>
    `;
  }

  static generateFooter(): string {
    return `
      <div style="background-color: #f8fafc; padding: 20px 0; border-radius: 0 0 8px 8px; margin-top: 30px;">
        <div style="max-width: 600px; margin: 0 auto; padding: 0 20px; text-align: center;">
          <div style="color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            <p style="margin: 0;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </div>
    `;
  }

  static generateFullTemplate(
    content: string,
    branding: CompanyBranding = DEFAULT_COMPANY_BRANDING,
  ): string {
    const header = this.generateHeader(branding);
    const footer = this.generateFooter();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>TEAMBOARD</title>
        <style>
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              padding: 10px !important;
            }
            .email-content {
              padding: 15px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
        <div class="email-container" style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          ${header}
          <div class="email-content" style="padding: 30px 20px;">
            ${content}
          </div>
          ${footer}
        </div>
      </body>
      </html>
    `;
  }

  static verificationEmailTemplate(
    verificationLink: string,
    branding: CompanyBranding = DEFAULT_COMPANY_BRANDING,
  ): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%); color: white; padding: 20px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 24px;">✉️ Verify Your Email</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for signing up! Please verify your email address to activate your account.</p>
        </div>
      </div>
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <a href="${verificationLink}" style="display: inline-block; background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%); color: white; padding: 15px 30px; border-radius: 6px; font-size: 18px; font-weight: 600; text-decoration: none; margin: 20px 0;">Verify Email</a>
        <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br><span style="color: #4682B4;">${verificationLink}</span></p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0; color: #666; font-size: 16px;">
          Thank you 
        </p>
      </div>
    `;
    return this.generateFullTemplate(content, branding);
  }

  static passwordResetEmailTemplate(
    resetLink: string,
    // branding: CompanyBranding = DEFAULT_COMPANY_BRANDING,
  ): string {
    const content = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%); color: white; padding: 20px; border-radius: 8px; display: inline-block;">
          <h2 style="margin: 0; font-size: 24px;">🔒 Reset Your Password</h2>
          <p style="margin: 10px 0 0 0; font-size: 16px;">We received a request to reset your password. Click the button below to proceed.</p>
        </div>
      </div>
      <div style="background: #E6F3FF; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
        <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #87CEEB 0%, #B0E0E6 100%); color: white; padding: 15px 30px; border-radius: 6px; font-size: 18px; font-weight: 600; text-decoration: none; margin: 20px 0;">Reset Password</a>
        <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">Or copy and paste this link in your browser:<br><span style="color: #4682B4;">${resetLink}</span></p>
        <p style="margin: 20px 0 0 0; color: #f44336; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <p style="margin: 0; color: #666; font-size: 16px;">
          Thank you 
        </p>
      </div>
    `;
    return this.generateFullTemplate(content);
  }
}
