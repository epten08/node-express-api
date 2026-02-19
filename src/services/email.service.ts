import { config } from '../config/index.js';
import { logger } from '../config/logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private readonly fromEmail: string;
  private readonly appName: string;

  constructor() {
    this.fromEmail = config.email?.from || 'noreply@example.com';
    this.appName = config.email?.appName || 'Express API';
  }

  async send(options: EmailOptions): Promise<boolean> {
    // In development/test, log the email instead of sending
    if (config.env !== 'production') {
      logger.info({
        msg: 'Email would be sent',
        to: options.to,
        subject: options.subject,
        text: options.text,
      });
      return true;
    }

    // In production, implement your email provider here
    // Examples: SendGrid, AWS SES, Resend, Nodemailer with SMTP
    //
    // import { Resend } from 'resend';
    // const resend = new Resend(config.email.apiKey);
    // await resend.emails.send({
    //   from: this.fromEmail,
    //   to: options.to,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });

    logger.warn('Email sending not configured for production');
    return true;
  }

  async sendVerificationEmail(email: string, token: string): Promise<boolean> {
    const verificationUrl = `${config.appUrl}/api/v1/auth/verify-email?token=${token}`;

    return this.send({
      to: email,
      subject: `Verify your email - ${this.appName}`,
      text: `Please verify your email by clicking the following link: ${verificationUrl}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify your email</h2>
          <p>Please verify your email by clicking the button below:</p>
          <p style="margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Verify Email
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 24 hours.<br>
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<boolean> {
    const resetUrl = `${config.appUrl}/reset-password?token=${token}`;

    return this.send({
      to: email,
      subject: `Reset your password - ${this.appName}`,
      text: `You requested a password reset. Click the following link to reset your password: ${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, you can safely ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset your password</h2>
          <p>You requested a password reset. Click the button below to reset your password:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Reset Password
            </a>
          </p>
          <p>Or copy and paste this link in your browser:</p>
          <p style="color: #666; word-break: break-all;">${resetUrl}</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            This link will expire in 1 hour.<br>
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Welcome to ${this.appName}!`,
      text: `Hi ${name},\n\nWelcome to ${this.appName}! Your account has been verified successfully.\n\nYou can now log in and start using our services.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to ${this.appName}!</h2>
          <p>Hi ${name},</p>
          <p>Your account has been verified successfully.</p>
          <p>You can now log in and start using our services.</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
