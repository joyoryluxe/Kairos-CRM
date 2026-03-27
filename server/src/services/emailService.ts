import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import { env } from '../config/env';

export interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  /**
   * Send an email using a Handlebars template
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const templatePath = path.join(__dirname, '../templates/emails', `${options.template}.hbs`);
      const templateSource = await fs.readFile(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateSource);
      const html = compiledTemplate(options.context);

      const mailOptions = {
        from: env.EMAIL_FROM,
        to: options.to,
        subject: options.subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Could not send email');
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
