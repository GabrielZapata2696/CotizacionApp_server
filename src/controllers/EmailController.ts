import { Request, Response } from 'express';
import { EmailService } from '@/services/EmailService';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/ApiResponse';

export class EmailController {
  private emailService = new EmailService();

  public async sendTestEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        const response: ApiResponse = {
          success: false,
          message: 'Email address is required',
        };
        res.status(400).json(response);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email format',
        };
        res.status(400).json(response);
        return;
      }

      await this.emailService.sendTestEmail(email);

      const response: ApiResponse = {
        success: true,
        message: 'Test email sent successfully',
        data: { email }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error sending test email:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send test email',
      };
      res.status(500).json(response);
    }
  }

  public async sendWelcomeEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, name } = req.body;
      
      if (!email || !name) {
        const response: ApiResponse = {
          success: false,
          message: 'Email and name are required',
        };
        res.status(400).json(response);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email format',
        };
        res.status(400).json(response);
        return;
      }

      await this.emailService.sendWelcomeEmail(email, name);

      const response: ApiResponse = {
        success: true,
        message: 'Welcome email sent successfully',
        data: { email, name }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send welcome email',
      };
      res.status(500).json(response);
    }
  }

  public async sendPasswordResetEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        const response: ApiResponse = {
          success: false,
          message: 'Email address is required',
        };
        res.status(400).json(response);
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        const response: ApiResponse = {
          success: false,
          message: 'Invalid email format',
        };
        res.status(400).json(response);
        return;
      }

      // Generate a sample reset token for testing (this is just for email endpoint testing)
      const sampleResetToken = 'sample-reset-token-' + Date.now();
      
      await this.emailService.sendPasswordResetEmail(email, sampleResetToken);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset email sent successfully (test endpoint)',
        data: { 
          email, 
          note: 'This is the test endpoint. Use /auth/forgot-password for real password resets with JWT tokens'
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send password reset email',
      };
      res.status(500).json(response);
    }
  }

  public async sendCustomEmail(req: Request, res: Response): Promise<void> {
    try {
      const { to, subject, html, text } = req.body;

      if (!to || !subject || !html) {
        const response: ApiResponse = {
          success: false,
          message: 'to, subject, and html are required fields',
        };
        res.status(400).json(response);
        return;
      }

      // Basic email validation for single email or array of emails
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = Array.isArray(to) ? to : [to];
      
      for (const email of emails) {
        if (!emailRegex.test(email)) {
          const response: ApiResponse = {
            success: false,
            message: `Invalid email format: ${email}`,
          };
          res.status(400).json(response);
          return;
        }
      }

      await this.emailService.sendEmail({
        to,
        subject,
        html,
        text
      });

      const response: ApiResponse = {
        success: true,
        message: 'Custom email sent successfully',
        data: { to, subject }
      };

      res.json(response);
    } catch (error) {
      logger.error('Error sending custom email:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Failed to send custom email',
      };
      res.status(500).json(response);
    }
  }
}
