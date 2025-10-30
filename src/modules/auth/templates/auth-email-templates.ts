import {
  BaseEmailTemplate,
  EmailTemplateFunction,
  DEFAULT_COMPANY_BRANDING,
} from '../../../core/templates/email';
import { EmailTemplateUtils } from '../../../core/templates/email/base-template-utils';

export interface EmailVerificationData {
  verificationLink: string;
  userEmail: string;
}

export interface PasswordResetData {
  resetLink: string;
  userEmail: string;
}

export interface AdminCredentialsData {
  userEmail: string;
  password: string;
}

export const emailVerificationTemplate: EmailTemplateFunction<
  EmailVerificationData
> = (data: EmailVerificationData): BaseEmailTemplate => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%); color: white; padding: 20px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 24px;">✉️ Verify Your Email</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Thank you for signing up! Please verify your email address to activate your account.</p>
      </div>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">📧 Email Verification Required</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6; font-size: 16px;">
        To complete your registration and activate your account, please verify your email address by clicking the button below.
      </p>
    </div>

    <div style="background: #e3f2fd; border: 1px solid #2196f3; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
        <tr>
          <td style="border-radius: 6px; background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);">
            <a href="${data.verificationLink}" style="display: inline-block; padding: 15px 30px; font-size: 18px; font-weight: 600; color: white; text-decoration: none; border-radius: 6px; background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%); box-shadow: 0 4px 6px rgba(33, 150, 243, 0.3);">
              ✅ Verify Email Address
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <span style="color: #2196f3; word-break: break-all;">${data.verificationLink}</span>
      </p>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #856404;">⏰ Link Expiration</h3>
      <p style="margin: 0; color: #856404; font-size: 14px;">
        This verification link will expire in 24 hours for security reasons.
      </p>
    </div>

    <div style="background: #f0f8ff; border: 1px solid #667eea; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 16px;">❓ Need Help?</h3>
      <p style="margin: 0; color: #667eea;">
        If you didn't create an account or have any questions, please contact our support team.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #666; font-size: 16px;">
        Thank you for choosing <strong>${DEFAULT_COMPANY_BRANDING.companyName}</strong>!
      </p>
    </div>
  `;

  return {
    subject: 'Verify Your Email Address',
    html: EmailTemplateUtils.generateFullTemplate(content),
  };
};

export const passwordResetTemplate: EmailTemplateFunction<PasswordResetData> = (
  data: PasswordResetData,
): BaseEmailTemplate => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); color: white; padding: 20px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 24px;">🔒 Reset Your Password</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">We received a request to reset your password. Click the button below to proceed.</p>
      </div>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🔑 Password Reset Request</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6; font-size: 16px;">
        Someone requested a password reset for your account. If this was you, click the button below to create a new password.
      </p>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ff9800; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 20px auto;">
        <tr>
          <td style="border-radius: 6px; background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);">
            <a href="${data.resetLink}" style="display: inline-block; padding: 15px 30px; font-size: 18px; font-weight: 600; color: white; text-decoration: none; border-radius: 6px; background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%); box-shadow: 0 4px 6px rgba(255, 152, 0, 0.3);">
              🔄 Reset Password
            </a>
          </td>
        </tr>
      </table>
      <p style="margin: 20px 0 0 0; color: #666; font-size: 14px;">
        Or copy and paste this link in your browser:<br>
        <span style="color: #ff9800; word-break: break-all;">${data.resetLink}</span>
      </p>
    </div>

    <div style="background: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #c62828;">⚠️ Security Notice</h3>
      <p style="margin: 0; color: #c62828; font-size: 14px;">
        If you did not request this password reset, please ignore this email. Your password will remain unchanged.
      </p>
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #856404;">⏰ Link Expiration</h3>
      <p style="margin: 0; color: #856404; font-size: 14px;">
        This reset link will expire in 1 hour for security reasons.
      </p>
    </div>

    <div style="background: #f0f8ff; border: 1px solid #667eea; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 16px;">❓ Need Help?</h3>
      <p style="margin: 0; color: #667eea;">
        If you have any questions or need assistance, please contact our support team.
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #666; font-size: 16px;">
        Thank you for choosing <strong>${DEFAULT_COMPANY_BRANDING.companyName}</strong>!
      </p>
    </div>
  `;

  return {
    subject: 'Reset Your Password',
    html: EmailTemplateUtils.generateFullTemplate(content),
  };
};

export const adminCredentialsTemplate: EmailTemplateFunction<
  AdminCredentialsData
> = (data: AdminCredentialsData): BaseEmailTemplate => {
  const content = `
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="background: linear-gradient(135deg, #9c27b0 0%, #ba68c8 100%); color: white; padding: 20px; border-radius: 8px; display: inline-block;">
        <h2 style="margin: 0; font-size: 24px;">👑 Admin Account Created</h2>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Your administrator account has been successfully created!</p>
      </div>
    </div>

    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
      <h3 style="margin: 0 0 15px 0; color: #333; font-size: 18px;">🔐 Account Credentials</h3>
      <p style="margin: 0 0 20px 0; color: #666; line-height: 1.6; font-size: 16px;">
        Your administrator account has been created with the following credentials. Please keep these secure and change your password after your first login.
      </p>
    </div>

    <div style="background: #e8f5e8; border: 1px solid #4caf50; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h3 style="margin: 0 0 15px 0; color: #2e7d32; font-size: 16px;">📧 Login Information</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 16px;">
        <div style="text-align: right;">
          <strong>Email:</strong>
        </div>
        <div style="text-align: left; color: #2e7d32; font-weight: 600;">
          ${data.userEmail}
        </div>
        <div style="text-align: right;">
          <strong>Password:</strong>
        </div>
        <div style="text-align: left; color: #2e7d32; font-weight: 600; font-family: monospace; background: #f1f8e9; padding: 5px; border-radius: 4px;">
          ${data.password}
        </div>
      </div>
    </div>

    <div style="background: #ffebee; border: 1px solid #f44336; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #c62828;">⚠️ Security Reminder</h3>
      <p style="margin: 0; color: #c62828; font-size: 14px;">
        <strong>Important:</strong> Please log in immediately and change your password to ensure the security of your account.
      </p>
    </div>

    <div style="background: #f0f8ff; border: 1px solid #667eea; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <h3 style="margin: 0 0 15px 0; color: #667eea; font-size: 16px;">🚀 Next Steps</h3>
      <ul style="margin: 0; padding-left: 20px; color: #667eea; line-height: 1.6; text-align: left;">
        <li>Log in to your account using the credentials above</li>
        <li>Change your password immediately</li>
        <li>Set up your profile and preferences</li>
        <li>Explore the admin dashboard and features</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="margin: 0; color: #666; font-size: 16px;">
        Welcome to <strong>${DEFAULT_COMPANY_BRANDING.companyName}</strong>!
      </p>
    </div>
  `;

  return {
    subject: 'Your Administrator Account Credentials',
    html: EmailTemplateUtils.generateFullTemplate(content),
  };
};
