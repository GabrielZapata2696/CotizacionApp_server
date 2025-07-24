import crypto from 'crypto';
import { Usuario } from '@/models/Usuario';
import { logger } from '@/utils/logger';

export interface PasswordResetToken {
  token: string;
  userId: number;
  expiresAt: Date;
}

export class TokenService {
  
  /**
   * Generates a cryptographically secure random token
   * @param length - Length of the token in bytes (default: 32)
   * @returns Secure random token as hex string
   */
  public generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generates a password reset token for a user
   * @param userId - User ID
   * @param expirationHours - Token expiration time in hours (default: 1)
   * @returns Password reset token string
   */
  public async generatePasswordResetToken(userId: number, expirationHours: number = 1): Promise<string> {
    try {
      // Generate secure random token
      const token = this.generateSecureToken(32); // 64 character hex string
      
      // Calculate expiration time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + expirationHours);

      // Store token in database
      await Usuario.update(
        {
          resetPasswordToken: token,
          resetPasswordExpires: expiresAt
        },
        {
          where: { id: userId }
        }
      );

      logger.info(`Password reset token generated for user ${userId}`, {
        userId,
        tokenLength: token.length,
        expiresAt: expiresAt.toISOString()
      });

      return token;
    } catch (error) {
      logger.error('Error generating password reset token:', error);
      throw new Error('Failed to generate password reset token');
    }
  }

  /**
   * Validates a password reset token
   * @param token - Token to validate
   * @returns User object if token is valid, null otherwise
   */
  public async validatePasswordResetToken(token: string): Promise<Usuario | null> {
    try {
      if (!token || token.length !== 64) {
        logger.warn('Invalid token format provided');
        return null;
      }

      // Find user with this token that hasn't expired
      const user = await Usuario.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            [require('sequelize').Op.gt]: new Date() // Token not expired
          }
        }
      });

      if (!user) {
        logger.warn('Invalid or expired password reset token', { token: token.substring(0, 8) + '...' });
        return null;
      }

      logger.info(`Valid password reset token found for user ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error validating password reset token:', error);
      return null;
    }
  }

  /**
   * Invalidates a password reset token
   * @param userId - User ID
   */
  public async invalidatePasswordResetToken(userId: number): Promise<void> {
    try {
      await Usuario.update(
        {
          resetPasswordToken: null,
          resetPasswordExpires: null
        },
        {
          where: { id: userId }
        }
      );

      logger.info(`Password reset token invalidated for user ${userId}`);
    } catch (error) {
      logger.error('Error invalidating password reset token:', error);
      throw new Error('Failed to invalidate password reset token');
    }
  }

  /**
   * Cleans up expired password reset tokens
   * This should be called periodically (e.g., via cron job)
   */
  public async cleanupExpiredTokens(): Promise<void> {
    try {
      const result = await Usuario.update(
        {
          resetPasswordToken: null,
          resetPasswordExpires: null
        },
        {
          where: {
            resetPasswordExpires: {
              [require('sequelize').Op.lt]: new Date() // Expired tokens
            }
          }
        }
      );

      logger.info(`Cleaned up ${result[0]} expired password reset tokens`);
    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Generates a secure session token
   * @param length - Length in bytes (default: 32)
   * @returns Secure session token
   */
  public generateSessionToken(length: number = 32): string {
    return this.generateSecureToken(length);
  }

  /**
   * Generates a secure API key
   * @param prefix - Optional prefix for the API key
   * @returns Secure API key with optional prefix
   */
  public generateApiKey(prefix?: string): string {
    const token = this.generateSecureToken(24); // 48 character hex string
    return prefix ? `${prefix}_${token}` : token;
  }

  /**
   * Generates a secure verification code (numeric)
   * @param length - Number of digits (default: 6)
   * @returns Numeric verification code
   */
  public generateVerificationCode(length: number = 6): string {
    const max = Math.pow(10, length) - 1;
    const min = Math.pow(10, length - 1);
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }

  /**
   * Hashes a password using bcrypt
   * @param password - Plain text password
   * @param saltRounds - Number of salt rounds (default: 12)
   * @returns Hashed password
   */
  public async hashPassword(password: string, saltRounds: number = 12): Promise<string> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Compares a password with its hash
   * @param password - Plain text password
   * @param hash - Hashed password
   * @returns True if password matches hash
   */
  public async comparePassword(password: string, hash: string): Promise<boolean> {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generates a secure temporary password
   * @param length - Length of the password (default: 12)
   * @returns Secure temporary password
   */
  public generateTemporaryPassword(length: number = 12): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  }
}
