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
        where: { email, estado: 1 }
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
      
      /* Verify password
      todo: implementar cuando bcrypt esté instalado
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        const response: ApiResponse = {
          success: false,
          message: 'Credenciales inválidas',
        };
        res.status(401).json(response);
        return;
      }*/

      // Check for existing active sessions
      // const hasActiveSession = await this.authService.hasActiveSession(user.id);
      // if (hasActiveSession) {
      //   const response: ApiResponse = {
      //     success: false,
      //     message: 'El usuario tiene una sesión activa. Ciérrela e intente nuevamente.',
      //   };
      //   res.status(409).json(response);
      //   return;
      // }

      // // Generate JWT tokens
      // const accessToken = jwt.sign(
      //   { 
      //     userId: user.id, 
      //     username: user.username, 
      //     role: user.rol 
      //   },
      //   config.jwt.secret,
      //   { expiresIn: config.jwt.expiresIn }
      // );

      // const refreshToken = jwt.sign(
      //   { userId: user.id },
      //   config.jwt.secret,
      //   { expiresIn: config.jwt.refreshExpiresIn }
      // );

      // // Create session record
      // await this.authService.createSession(user.id, accessToken, refreshToken);

      // // Log successful login
      // logger.info(`User ${user.username} logged in successfully`);

      // Return user data without password
      // const userData = await Usuario.findByPk(user.id, {
      //   include: ['company']
      // });

      const response: ApiResponse = {
        success: true,
        message: 'Login exitoso',
        data: {
          user,
          tokens: {
            // accessToken, 
            /** 
             * todo: implementar cuando jwt esté instalado
             */
            // refreshToken
          }
        }
      };

      // res.json(user);
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
        creacion: new Date(),
        estado: 1
      });

      logger.info(`New user registered: ${newUser.username}`);

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
      
      // Invalidate all user sessions
      await this.authService.invalidateUserSessions(userId);

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
        decoded = jwt.verify(refreshToken, config.jwt.secret);
      } catch (error) {
        const response: ApiResponse = {
          success: false,
          message: 'Refresh token inválido',
        };
        res.status(401).json(response);
        return;
      }

      // Find user and validate session
      const user = await Usuario.findByPk(decoded.userId);
      if (!user) {
        const response: ApiResponse = {
          success: false,
          message: 'Usuario no encontrado',
        };
        res.status(404).json(response);
        return;
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.rol 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      const response: ApiResponse = {
        success: true,
        message: 'Token actualizado',
        data: { accessToken: newAccessToken }
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
        where: { correo: email }
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

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, purpose: 'password_reset' },
        config.jwt.secret,
        { expiresIn: '1h' }
      );

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.correo, resetToken);

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
}
