import { logger } from '@/utils/logger';
import { config } from '@/config';
const nodemailer = require('nodemailer');

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: any;

  constructor() {
    // Initialize Gmail SMTP transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: config.email.smtp.user,
        pass: config.email.smtp.pass
      }
    });

    logger.info('Gmail SMTP email service initialized');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: config.email.smtp.from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        ...(options.text && { text: options.text })
      };

      logger.info(`Sending email to: ${options.to}`);
      
      const result = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent successfully via Gmail SMTP:`, {
        messageId: result.messageId,
        to: options.to,
        subject: options.subject,
        accepted: result.accepted,
        rejected: result.rejected
      });
    } catch (error) {
      logger.error('Error sending email via Gmail SMTP:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:4200'}/reset-password?token=${resetToken}`;
      
      const emailOptions: EmailOptions = {
        to: email,
        subject: 'Restablece tu contraseña - SITEKOL',
        html: this.getPasswordResetEmailTemplate(resetUrl),
        text: `Hola,\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nHaz clic en el siguiente enlace para restablecer tu contraseña:\n${resetUrl}\n\nEste enlace expirará en 1 hora.\n\nSi no solicitaste restablecer tu contraseña, ignora este correo.\n\nSaludos,\nEquipo SITEKOL`
      };

      await this.sendEmail(emailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      
      const emailOptions: EmailOptions = {
        to: email,
        subject: '¡Bienvenido a SITEKOL! - Tu cuenta ha sido creada exitosamente',
        html: this.getWelcomeEmailTemplate(name),
        text: `¡Hola ${name}!\n\n¡Bienvenido a SITEKOL!\n\nTu cuenta ha sido creada exitosamente. Ahora puedes acceder a nuestra plataforma de trading de metales.\n\nComienza explorando nuestras funcionalidades:\n- Consulta precios de metales en tiempo real\n- Realiza operaciones de compra y venta\n- Gestiona tu portafolio\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\nSaludos,\nEquipo SITEKOL`
      };

      await this.sendEmail(emailOptions);
      logger.info(`Welcome email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  async sendTestEmail(email: string): Promise<void> {
    try {
      const emailOptions: EmailOptions = {
        to: email,
        subject: 'Test Email from SITEKOL - Email Service Working!',
        html: this.getTestEmailTemplate(),
        text: 'This is a test email from SITEKOL. If you received this, the email service is working correctly!'
      };

      await this.sendEmail(emailOptions);
      logger.info(`Test email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending test email:', error);
      throw new Error('Failed to send test email');
    }
  }

  private getPasswordResetEmailTemplate(resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Restablece tu contraseña - SITEKOL</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 14px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SITEKOL</h1>
          </div>
          <div class="content">
            <h2>Restablece tu contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer tu contraseña en SITEKOL.</p>
            <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
            <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura.</p>
            <p>Saludos,<br>Equipo SITEKOL</p>
          </div>
          <div class="footer">
            <p>© 2024 SITEKOL. Todos los derechos reservados.</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>¡Bienvenido a SITEKOL!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #27ae60; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; }
          .feature { background-color: white; padding: 15px; margin: 10px 0; border-left: 4px solid #27ae60; }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 14px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a SITEKOL!</h1>
          </div>
          <div class="content">
            <h2>¡Hola ${name}!</h2>
            <p>¡Gracias por unirte a SITEKOL! Tu cuenta ha sido creada exitosamente.</p>
            <p>Ahora puedes acceder a todas nuestras funcionalidades:</p>
            
            <div class="feature">
              <h4>📈 Precios en Tiempo Real</h4>
              <p>Consulta los precios actualizados de metales preciosos</p>
            </div>
            
            <div class="feature">
              <h4>💼 Trading Profesional</h4>
              <p>Realiza operaciones de compra y venta de manera segura</p>
            </div>
            
            <div class="feature">
              <h4>📊 Gestión de Portafolio</h4>
              <p>Administra y monitorea tus inversiones</p>
            </div>
            
            <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            <p>¡Esperamos que disfrutes de la experiencia SITEKOL!</p>
            <p>Saludos,<br>Equipo SITEKOL</p>
          </div>
          <div class="footer">
            <p>© 2024 SITEKOL. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getTestEmailTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test Email - SITEKOL</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3498db; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; text-align: center; }
          .success { background-color: #2ecc71; color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .footer { background-color: #ecf0f1; padding: 20px; text-align: center; font-size: 14px; color: #7f8c8d; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SITEKOL - Test Email</h1>
          </div>
          <div class="content">
            <div class="success">
              <h2>✅ ¡Email Service Working!</h2>
            </div>
            <p>Congratulations! Your SITEKOL email service is working perfectly.</p>
            <p>This test email confirms that:</p>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
              <li>Gmail SMTP integration is successful</li>
              <li>Email templates are rendering correctly</li>
              <li>SMTP configuration is working</li>
              <li>Your application can send emails to any address</li>
            </ul>
            <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          </div>
          <div class="footer">
            <p>© 2024 SITEKOL. Test email generated automatically.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
