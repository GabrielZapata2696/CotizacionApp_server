import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Usuario } from '@/models/Usuario';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { ApiResponse } from '@/types/ApiResponse';
import { LoginDto, RegisterDto } from '@/types/AuthDto';
import { AuthService } from '@/services/AuthService';
import { EmailService } from '@/services/EmailService';

export class AuthController {
  private authService = new AuthService();
  private emailService = new EmailService();

  public async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginDto = req.body;
      
      // Find user with password included
      const user = await Usuario.scope('withPassword').findOne({
        where: { email, estado: true }
      });
      

      if (!user) {
        // Don't reveal if email exists or not for security
        const response: ApiResponse = {
          success: false,
          message: 'Credenciales inválidas',
        };
        res.status(401).json(response);
        return;
      }
      
      // Verify password     
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Credenciales inválidas',
        };
        res.status(401).json(response);
        return;
      }

      // Check for existing active sessions (optionally, you might want to allow multiple sessions)
      const hasActiveSession = await this.authService.hasActiveSession(user.id.toString());
      if (hasActiveSession) {
        // You can either reject or invalidate old sessions - for now, let's invalidate old ones
        await this.authService.invalidateUserSessions(user.id.toString());
      }
      
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.rol 
        },
        config.jwt.secret!,
        { expiresIn: config.jwt.expiresIn }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.secret!,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      // Optionally, you can send a welcome email or notification
      /**
       * todo: implementar el envio de email de bienvenida 
       *      await this.emailService.sendWelcomeEmail(user.email, user.nombre);
       */
      

      
      // Get session info from request
      const sessionInfo = {
        ip_address: req.ip || req.connection.remoteAddress || 'unknown',
        user_agent: req.get('User-Agent') || 'unknown'
      };

      // Create session record
      await this.authService.createSession(
        user.id.toString(), 
        accessToken, 
        refreshToken,
        sessionInfo
      );

      // Log successful login
      /**
       * todo: implementar el logger para registrar el inicio de sesión exitoso que registre en la base de datos
       * logger.info(`User ${user.username} logged in exitoso`);
       */

      // Return user data without password
      const userData = await Usuario.findByPk(user.id);

      const response: ApiResponse = {
        success: true,
        message: 'Login exitoso',
        data: {
          userData,       
          tokens: {
            accessToken,
            refreshToken
          }
        }
      };

      
      res.json(response);
    } catch (error) {
      logger.error('Login error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: RegisterDto = req.body;

      // Check if username already exists
      const existingUser = await Usuario.findOne({
        where: { username: userData.username }
      });

      if (existingUser) {
        const response: ApiResponse = {
          success: false,
          message: 'El username ya está en uso',
        };
        res.status(400).json(response);
        return;
      }

      // Check if document already exists
      const existingDocument = await Usuario.findOne({
        where: { documento: userData.documento }
      });

      if (existingDocument) {
        const response: ApiResponse = {
          success: false,
          message: 'El documento ya está registrado',
        };
        res.status(400).json(response);
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create user
      const newUser = await Usuario.create({
        ...userData,
        password: hashedPassword,
        estado: true
      });

      logger.info(`New user registered: ${newUser.username}`);

      // Send welcome email
      try {
        await this.emailService.sendWelcomeEmail(newUser.email, newUser.nombre);
      } catch (emailError) {
        logger.warn('Failed to send welcome email:', emailError);
        // Don't fail registration if email fails
      }

      const response: ApiResponse = {
        success: true,
        message: 'Usuario creado exitosamente',
        data: { userId: newUser.id }
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Registration error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  public async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).userId;
      const accessToken = req.headers.authorization?.replace('Bearer ', '');
      
      if (accessToken) {
        // Invalidate specific session by token
        await this.authService.invalidateSession(accessToken);
      } else {
        // Fallback: invalidate all user sessions
        await this.authService.invalidateUserSessions(userId.toString());
      }

      logger.info(`User ${userId} logged out`);

      const response: ApiResponse = {
        success: true,
        message: 'Logout exitoso',
      };

      res.json(response);
    } catch (error) {
      logger.error('Logout error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token requerido',
        };
        res.status(400).json(response);
        return;
      }

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, config.jwt.secret!);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token inválido',
        };
        res.status(401).json(response);
        return;
      }

      // Find user
      const user = await Usuario.findByPk(decoded.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      // Generate new tokens
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.rol 
        },
        config.jwt.secret!,
        { expiresIn: config.jwt.expiresIn }
      );

      const newRefreshToken = jwt.sign(
        { userId: user.id },
        config.jwt.secret!,
        { expiresIn: config.jwt.refreshExpiresIn }
      );

      // Refresh session with new tokens
      const refreshedSession = await this.authService.refreshSession(
        refreshToken,
        newAccessToken,
        newRefreshToken
      );

      if (!refreshedSession) {
        const response: ApiResponse = {
          success: false,
          message: 'Sesión expirada o inválida',
        };
        res.status(401).json(response);
        return;
      }

      const response: ApiResponse = {
        success: true,
        message: 'Tokens actualizados',
        data: { 
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      };

      res.json(response);
    } catch (error) {
      logger.error('Refresh token error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      const user = await Usuario.findOne({
        where: { email: email }
      });
      
      if (!user) {
        // Don't reveal if email exists or not for security
        const response: ApiResponse = {
          success: true,
          message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
        };
        res.json(response);
        return;
      }

      // Generate secure JWT reset token
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password_reset' },
        config.jwt.secret!,
        { expiresIn: '1h' } // Token expires in 1 hour
      );
      console.log(`Generated reset token for user ${user.id}: ${resetToken}`);
      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);

      logger.info(`Password reset email sent to: ${email}`, {
        userId: user.id,
        tokenLength: resetToken.length
      });

      const response: ApiResponse = {
        success: true,
        message: 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña',
      };

      res.json(response);
    } catch (error) {
      logger.error('Forgot password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Token y nueva contraseña son requeridos',
        };
        res.status(400).json(response);
        return;
      }

      // Validate password strength
      if (newPassword.length < 8) {
        const response: ApiResponse = {
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres',
        };
        res.status(400).json(response);
        return;
      }

      // Verify and decode the JWT token
      let decoded: any;
      try {
        decoded = jwt.verify(token, config.jwt.secret!);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Token inválido o expirado',
        };
        res.status(400).json(response);
        return;
      }

      // Verify token purpose
      if (decoded.purpose !== 'password_reset') {
        const response: ApiResponse = {
          success: false,
          message: 'Token inválido',
        };
        res.status(400).json(response);
        return;
      }

      // Find user
      const user = await Usuario.findByPk(decoded.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update user password
      await Usuario.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      // Invalidate all user sessions for security
      await this.authService.invalidateUserSessions(user.id.toString());

      logger.info(`Password reset successful for user ${user.id}`);

      const response: ApiResponse = {
        success: true,
        message: 'Contraseña restablecida exitosamente',
      };

      res.json(response);
    } catch (error) {
      logger.error('Reset password error:', error);
      const response: ApiResponse = {
        success: false,
        message: 'Error interno del servidor',
      };
      res.status(500).json(response);
    }
  }
}
